package com.hero.parts.loader;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.hero.parts.model.Category;
import com.hero.parts.model.Part;
import com.hero.parts.model.SearchAlias;
import jakarta.persistence.EntityManager;
import jakarta.persistence.PersistenceContext;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.io.File;
import java.math.BigDecimal;
import java.util.List;
import java.util.Map;

/**
 * Promotes rows from the `scraped_parts` staging table (populated by hero-parts-scraper)
 * into the live `parts` table.
 *
 * Trigger manually via the /api/v1/admin/load-scraped endpoint, or call loadAll() from a
 * Spring Boot CommandLineRunner if you want it on startup.
 *
 * Only inserts parts whose SKU (derived from the URL slug) does not already exist.
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class ScrapedPartsLoader {

    private final JdbcTemplate jdbc;

    @PersistenceContext
    private final EntityManager em;

    @Transactional
    public LoadResult loadAll() {
        // Verify staging table exists
        try {
            jdbc.queryForObject("SELECT COUNT(*) FROM scraped_parts", Long.class);
        } catch (Exception e) {
            return new LoadResult(0, 0, "scraped_parts table not found. Run parts.sql first.");
        }

        List<Map<String, Object>> rows = jdbc.queryForList(
            "SELECT id, name, sku, price, mrp, url, slug, image_url FROM scraped_parts"
        );

        // Find the default "Body Parts" category (id=1 from seed data, fallback to first)
        Long defaultCategoryId = findDefaultCategoryId();

        int inserted = 0;
        int skipped = 0;

        for (Map<String, Object> row : rows) {
            String slug = (String) row.get("slug");
            String name = (String) row.get("name");
            String url  = (String) row.get("url");

            if (slug == null || slug.isBlank() || name == null || name.isBlank()) {
                skipped++;
                continue;
            }

            // Prefer the raw SKU from the API; fall back to a slug-derived SKU
            String rawSku = (String) row.get("sku");
            String sku = (rawSku != null && !rawSku.isBlank())
                ? rawSku.substring(0, Math.min(rawSku.length(), 50))
                : slug.toUpperCase().replace("-", "_").substring(0, Math.min(slug.length(), 50));

            // Skip if already loaded
            Long existing = jdbc.queryForObject(
                "SELECT COUNT(*) FROM parts WHERE sku = ?", Long.class, sku
            );
            if (existing != null && existing > 0) {
                skipped++;
                continue;
            }

            BigDecimal price = toBigDecimal(row.get("price"));
            BigDecimal mrp   = toBigDecimal(row.get("mrp"));
            if (mrp == null) mrp = price;
            String description = "Price indicative — scraped from Hero eShop collection page. Verify on eShop.";

            // Build the entity and persist
            Part part = new Part();
            part.setSku(sku);
            part.setName(name);
            part.setDescription(description);
            part.setPrice(price != null ? price : BigDecimal.ZERO);
            part.setMrp(mrp   != null ? mrp   : BigDecimal.ZERO);
            part.setUnit("1 piece");
            part.setEshopUrl(url != null ? stripOrigin(url) : null);
            String imageUrl = (String) row.get("image_url");
            part.setImageUrl(imageUrl != null && !imageUrl.isBlank() ? imageUrl : null);
            part.setInStock(true);
            part.setStockQty(0);

            // Assign to default category; admin can re-categorise via API later
            if (defaultCategoryId != null) {
                Category cat = em.getReference(
                    Category.class, defaultCategoryId
                );
                part.setCategory(cat);
            }

            em.persist(part);

            // Add a SLANG alias from the slug (e.g. "hero-genuine-holder-comp-element" → usable search term)
            SearchAlias alias = new SearchAlias();
            alias.setPart(part);
            alias.setAlias(slug.replace("-", " "));
            alias.setAliasType(SearchAlias.AliasType.SLANG);
            alias.setLanguage("en");
            em.persist(alias);

            inserted++;

            if (inserted % 100 == 0) {
                em.flush();
                em.clear();
                log.info("Loaded {} parts so far…", inserted);
            }
        }

        log.info("ScrapedPartsLoader complete: {} inserted, {} skipped", inserted, skipped);
        return new LoadResult(inserted, skipped, null);
    }

    private Long findDefaultCategoryId() {
        try {
            return jdbc.queryForObject(
                "SELECT id FROM categories ORDER BY id LIMIT 1", Long.class
            );
        } catch (Exception e) {
            return null;
        }
    }

    private BigDecimal toBigDecimal(Object obj) {
        if (obj instanceof BigDecimal bd) return bd;
        if (obj instanceof Number n) return BigDecimal.valueOf(n.doubleValue());
        return null;
    }

    private String stripOrigin(String url) {
        // "https://shop.heromotocorp.com/en/product/foo" → "/en/product/foo"
        return url.replaceFirst("^https?://[^/]+", "");
    }

    /**
     * Load directly from the scraper's parts.json — no H2 staging table needed.
     * jsonPath: absolute path to parts.json (e.g. /path/to/hero-parts-scraper/parts.json)
     */
    @Transactional
    public LoadResult loadFromJson(String jsonPath) {
        File file = new File(jsonPath);
        if (!file.exists()) {
            return new LoadResult(0, 0, "File not found: " + jsonPath);
        }

        List<Map<String, Object>> items;
        try {
            items = new ObjectMapper().readValue(file, new TypeReference<>() {});
        } catch (Exception e) {
            return new LoadResult(0, 0, "Failed to parse JSON: " + e.getMessage());
        }

        Long defaultCategoryId = findDefaultCategoryId();
        int inserted = 0;
        int skipped  = 0;

        for (Map<String, Object> item : items) {
            String name     = (String) item.get("name");
            String slug     = (String) item.get("slug");
            String url      = (String) item.get("url");
            String imageUrl = (String) item.get("imageUrl");

            if (slug == null || slug.isBlank() || name == null || name.isBlank()) {
                skipped++;
                continue;
            }

            String rawSku = (String) item.get("sku");
            String sku = (rawSku != null && !rawSku.isBlank())
                ? rawSku.substring(0, Math.min(rawSku.length(), 50))
                : slug.toUpperCase().replace("-", "_").substring(0, Math.min(slug.length(), 50));

            Long existing = jdbc.queryForObject(
                "SELECT COUNT(*) FROM parts WHERE sku = ?", Long.class, sku);
            if (existing != null && existing > 0) {
                // Part already exists — update image_url if we now have one
                if (imageUrl != null && !imageUrl.isBlank()) {
                    jdbc.update("UPDATE parts SET image_url = ? WHERE sku = ? AND image_url IS NULL",
                            imageUrl, sku);
                }
                skipped++;
                continue;
            }

            BigDecimal price = toBigDecimal(item.get("price"));
            BigDecimal mrp   = toBigDecimal(item.get("mrp"));
            if (mrp == null) mrp = price;

            Part part = new Part();
            part.setSku(sku);
            part.setName(name);
            part.setDescription("Price indicative — scraped from Hero eShop. Verify on eShop.");
            part.setPrice(price != null ? price : BigDecimal.ZERO);
            part.setMrp(mrp   != null ? mrp   : BigDecimal.ZERO);
            part.setUnit("1 piece");
            part.setEshopUrl(url != null ? stripOrigin(url) : null);
            part.setImageUrl(imageUrl != null && !imageUrl.isBlank() ? imageUrl : null);
            part.setInStock(true);
            part.setStockQty(0);

            if (defaultCategoryId != null) {
                part.setCategory(em.getReference(Category.class, defaultCategoryId));
            }
            em.persist(part);

            SearchAlias alias = new SearchAlias();
            alias.setPart(part);
            alias.setAlias(slug.replace("-", " "));
            alias.setAliasType(SearchAlias.AliasType.SLANG);
            alias.setLanguage("en");
            em.persist(alias);

            inserted++;
            if (inserted % 100 == 0) {
                em.flush();
                em.clear();
                log.info("Loaded {} parts so far…", inserted);
            }
        }

        log.info("loadFromJson complete: {} inserted, {} skipped", inserted, skipped);
        return new LoadResult(inserted, skipped, null);
    }

    public record LoadResult(int inserted, int skipped, String error) {}
}
