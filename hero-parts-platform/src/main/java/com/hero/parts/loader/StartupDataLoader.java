package com.hero.parts.loader;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.hero.parts.model.Category;
import com.hero.parts.model.Part;
import com.hero.parts.model.SearchAlias;
import com.hero.parts.repository.CategoryRepository;
import jakarta.persistence.EntityManager;
import jakarta.persistence.PersistenceContext;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.core.annotation.Order;
import org.springframework.core.io.ClassPathResource;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.io.InputStream;
import java.math.BigDecimal;
import java.util.*;

/**
 * Loads parts-seed.json on startup when the parts table has fewer than 100 rows.
 * Each part gets a slug alias plus keyword-inferred Hindi/slang/symptom aliases.
 */
@Slf4j
@Component
@Order(2)
@RequiredArgsConstructor
public class StartupDataLoader implements ApplicationRunner {

    private final JdbcTemplate       jdbc;
    private final CategoryRepository  categoryRepo;
    private final ObjectMapper        objectMapper;

    @PersistenceContext
    private final EntityManager em;

    private static final String SEED_FILE = "parts-seed.json";
    private static final int    THRESHOLD  = 100;

    // Maps a keyword found in the English part name → aliases to add.
    // Ordered longest-first so "spark plug" matches before "plug".
    private static final List<String[]> KEYWORD_ALIASES = List.of(
        // keyword (lowercase)             aliases...
        new String[]{"spark plug",         "masala", "masale", "bujji", "sparking nahi", "plug", "misfire", "miss fire"},
        new String[]{"spark plug cap",     "plug cap", "ht cap"},
        new String[]{"spark plug wire",    "ht wire", "coil wire", "ignition wire"},
        new String[]{"ignition coil",      "ht coil", "coil", "spark coil"},
        new String[]{"oil filter",         "tel filter", "oil chalni", "tel ka filter"},
        new String[]{"air filter",         "hawa filter", "jali", "air philthar", "saans filter"},
        new String[]{"engine oil",         "tel", "tabbdil", "mobil", "motor oil", "4 stroke oil"},
        new String[]{"brake shoe",         "lining", "brake lining", "brek shoe", "liner"},
        new String[]{"brake pad",          "lining", "brake lining", "disk pad", "disc pad"},
        new String[]{"disc brake",         "disk brake", "disk", "disc"},
        new String[]{"brake disc",         "rotor", "rotar", "disk rotor"},
        new String[]{"brake caliper",      "caliper", "calliper", "disc caliper"},
        new String[]{"master cylinder",    "brake pump", "brake master"},
        new String[]{"brake cable",        "brake taar", "brake wire"},
        new String[]{"shock absorber",     "shocker", "shokr", "rear shocker", "jhakka aata hai"},
        new String[]{"front fork",         "agla kanta", "fork assembly", "aage ka kanta"},
        new String[]{"fork seal",          "tel seal", "fork oil seal", "aage se tel tapakna"},
        new String[]{"rubber bush",        "bush", "rubber bushing"},
        new String[]{"clutch plate",       "fiber", "fibre", "clutch kit", "clutch slip"},
        new String[]{"clutch cable",       "clutch taar", "clutch wire", "cluch cable"},
        new String[]{"drive chain",        "zanjeer", "chein", "chain", "patta"},
        new String[]{"chain sprocket",     "tara", "star", "chakri", "chakradant", "dant", "sprocket", "chain kit"},
        new String[]{"sprocket",           "tara", "star", "chakri", "chakradant", "dant"},
        new String[]{"chain cover",        "chain guard", "chain dhakkan"},
        new String[]{"battery",            "batri", "self start nahi", "amaron", "exide", "12v battery"},
        new String[]{"alternator",         "dynamo", "charging coil"},
        new String[]{"stator",             "stator coil", "charging coil", "dynamo"},
        new String[]{"rectifier",          "regulator", "charging nahi", "rectifar", "voltage regulator"},
        new String[]{"fuse",               "fuse box", "fuse holder", "fuse wire"},
        new String[]{"relay",              "relay switch", "starter relay"},
        new String[]{"ignition switch",    "kill switch", "main switch", "on off switch"},
        new String[]{"headlight",          "headlayt", "batti aage", "head light bulb", "light nahi"},
        new String[]{"tail light",         "piche ki batti", "tail batti", "pilot", "rear light"},
        new String[]{"indicator",          "blinker", "indicator batti", "dikhavni batti", "disco", "indicator nahi"},
        new String[]{"horn",               "ghanta", "ghanti", "pressure horn", "horn nahi"},
        new String[]{"silencer",           "muffler", "pot", "exhost", "dhuan aa raha"},
        new String[]{"exhaust",            "silencer", "muffler", "pot", "pipe"},
        new String[]{"carburetor",         "carbi", "carbrate", "petrol nahi aa raha", "mileage kharab"},
        new String[]{"carburettor",        "carbi", "carbrate", "petrol nahi aa raha"},
        new String[]{"throttle cable",     "gas taar", "accelerator cable", "gas cable", "gas wire"},
        new String[]{"fuel pipe",          "petrol pipe", "nali", "petrol nali", "fuel hose"},
        new String[]{"fuel tank",          "petrol tank", "tank"},
        new String[]{"petcock",            "petrol cock", "tap", "fuel valve"},
        new String[]{"piston",             "pistn", "dhakkan engine"},
        new String[]{"piston ring",        "ring set", "engine ring"},
        new String[]{"gasket",             "joint", "sar gasket", "head joint", "engine leak"},
        new String[]{"crankshaft",         "crank", "main bearing", "crank beering"},
        new String[]{"camshaft",           "cam shaft", "valve timing", "kamshaft"},
        new String[]{"timing chain",       "cam chain", "timing chain tensioner"},
        new String[]{"valve guide",        "inlet valve", "exhaust valve"},
        new String[]{"rocker arm",         "rocker", "tappet", "valve rocker"},
        new String[]{"tyre",               "tire", "tube tyre"},
        new String[]{"wheel rim",          "rim", "chakka rim", "alloy rim"},
        new String[]{"spoke",              "taana", "spokes"},
        new String[]{"tyre valve",         "valve", "tube valve", "air valve"},
        new String[]{"inner tube",         "ander ki tube", "tube"},
        new String[]{"mudguard",           "fender", "mud guard", "mudgard"},
        new String[]{"saree guard",        "sari guard", "ladies guard", "leg guard"},
        new String[]{"side panel",         "side cover", "sayd panel"},
        new String[]{"seat",               "gaddi", "seat cover", "cushion"},
        new String[]{"handlebar",          "handal", "handle", "handle bar"},
        new String[]{"handle grip",        "grip", "rubber grip", "handle rubber"},
        new String[]{"mirror",             "aaina", "saida", "rear view"},
        new String[]{"footrest",           "footer", "foot peg", "footpeg", "foot rest"},
        new String[]{"center stand",       "main stand", "centre stand"},
        new String[]{"side stand",         "lalten stand"},
        new String[]{"number plate",       "nambur plate", "name plate"},
        new String[]{"cdi",                "ignition module", "cdi box", "start nahi hona"},
        new String[]{"kick starter",       "kick", "kick lever", "starter lever", "kick pedal"},
        new String[]{"starter motor",      "self motor", "self nahi", "self start", "electric start"},
        new String[]{"speedometer",        "meter", "speed meter", "speedo", "meter nahi chalta"},
        new String[]{"speedometer cable",  "meter cable", "speedo cable"},
        new String[]{"cable",              "taar", "wire"},
        new String[]{"lever",              "brake lever", "clutch lever"}
    );

    @Override
    @Transactional
    public void run(ApplicationArguments args) throws Exception {
        Long count = jdbc.queryForObject("SELECT COUNT(*) FROM parts", Long.class);
        if (count != null && count >= THRESHOLD) {
            log.info("Parts table already has {} rows — skipping seed load.", count);
            return;
        }

        ClassPathResource resource = new ClassPathResource(SEED_FILE);
        if (!resource.exists()) {
            log.warn("Seed file {} not found on classpath — skipping auto-load.", SEED_FILE);
            return;
        }

        log.info("Parts table has {} rows — loading {} …", count, SEED_FILE);

        // Build id→Category map so inferCategoryId() can look up entities by id
        Map<Long, Category> categoryMap = new HashMap<>();
        categoryRepo.findAll().forEach(c -> categoryMap.put(c.getId(), c));
        Category fallbackCategory = categoryMap.get(1L); // Engine as last resort

        try (InputStream is = resource.getInputStream()) {
            List<Map<String, Object>> items = objectMapper.readValue(
                is, new TypeReference<>() {}
            );

            int inserted = 0;
            int skipped  = 0;

            for (Map<String, Object> item : items) {
                String slug = str(item.get("slug"));
                String name = str(item.get("name"));
                if (slug == null || name == null) { skipped++; continue; }

                String rawSku = str(item.get("sku"));
                String sku = (rawSku != null && !rawSku.isBlank())
                    ? rawSku.substring(0, Math.min(rawSku.length(), 50))
                    : slug.toUpperCase().replace("-", "_").substring(0, Math.min(slug.length(), 50));

                Long existing = jdbc.queryForObject(
                    "SELECT COUNT(*) FROM parts WHERE sku = ?", Long.class, sku
                );
                if (existing != null && existing > 0) { skipped++; continue; }

                BigDecimal price = toBD(item.get("price"));
                BigDecimal mrp   = toBD(item.get("mrp"));
                if (mrp == null) mrp = price;

                String urlRaw = str(item.get("url"));
                String eshopUrl = urlRaw != null
                    ? urlRaw.replaceFirst("^https?://[^/]+", "")
                    : null;

                Part part = new Part();
                part.setSku(sku);
                part.setName(name.substring(0, Math.min(name.length(), 500)));
                part.setDescription("Price indicative — scraped from Hero eShop. Verify on eShop.");
                part.setPrice(price != null ? price : BigDecimal.ZERO);
                part.setMrp(mrp != null ? mrp : BigDecimal.ZERO);
                part.setUnit(str(item.get("unit")) != null ? str(item.get("unit")) : "1 piece");
                part.setEshopUrl(eshopUrl);
                part.setInStock(Boolean.TRUE.equals(item.get("inStock")));
                Object qtyObj = item.get("qty");
                part.setStockQty(qtyObj instanceof Number n ? n.intValue() : 0);
                String nameLower = name.toLowerCase();
                Long catId = inferCategoryId(nameLower);
                part.setCategory(categoryMap.getOrDefault(catId, fallbackCategory));
                em.persist(part);

                // Slug-based alias (English, searchable by partial name)
                persistAlias(part, slug.replace("-", " "), SearchAlias.AliasType.SLANG, "en");

                // Keyword-inferred Hindi / slang / symptom aliases
                Set<String> addedAliases = new HashSet<>();
                addedAliases.add(slug.replace("-", " "));

                for (String[] entry : KEYWORD_ALIASES) {
                    String keyword = entry[0];
                    if (nameLower.contains(keyword)) {
                        for (int i = 1; i < entry.length; i++) {
                            String aliasText = entry[i];
                            if (addedAliases.add(aliasText)) {
                                SearchAlias.AliasType type = inferType(aliasText);
                                String lang = isHindi(aliasText) ? "hi" : "en";
                                persistAlias(part, aliasText, type, lang);
                            }
                        }
                    }
                }

                inserted++;
                if (inserted % 200 == 0) {
                    em.flush();
                    em.clear();
                    log.info("  … {} / {} loaded", inserted, items.size());
                }
            }

            em.flush();
            log.info("StartupDataLoader complete: {} inserted, {} skipped.", inserted, skipped);
        }
    }

    /**
     * Infers the best-fit category ID from a part name.
     * Rules are ordered so more-specific checks win (e.g. "fork seal" → Suspension, not Gaskets).
     * Returns 1 (Engine) as the default fallback.
     */
    private static Long inferCategoryId(String n) {
        // 9 — Filters
        if (n.contains("filter")) return 9L;

        // 3 — Suspension (before seals so "fork seal" / "fork oil seal" → Suspension)
        if (n.contains("shock") || n.contains("fork") || n.contains("bush") || n.contains("suspension")) return 3L;

        // 10 — Gaskets & Seals
        if (n.contains("gasket") || n.contains("oil seal") || n.contains("valve seal")) return 10L;

        // 2 — Brakes
        if (n.contains("brake") || n.contains("caliper") || n.contains("master cylinder")
                || n.contains("rotor") || n.contains("disc pad") || n.contains("disk pad")) return 2L;

        // 4 — Electrical
        if (n.contains("spark plug") || n.contains("battery") || n.contains("bulb")
                || n.contains("headlight") || n.contains("tail light") || n.contains("indicator")
                || n.contains("horn") || n.contains("cdi") || n.contains("stator")
                || n.contains("alternator") || n.contains("rectifier") || n.contains("fuse")
                || n.contains("relay") || n.contains("speedometer") || n.contains("wiring")
                || n.contains("ignition") || n.contains("starter motor") || n.contains("self motor")
                || n.contains("magneto") || n.contains("self start")) return 4L;

        // 6 — Fuel System
        if (n.contains("carburet") || n.contains("fuel tank") || n.contains("petcock")
                || n.contains("throttle") || n.contains("fuel pipe") || n.contains("fuel hose")
                || n.contains("petrol tank") || n.contains("petrol pipe") || n.contains("choke")
                || n.contains("airbox") || n.contains("fuel tap")) return 6L;

        // 7 — Transmission (chain cover/guard excluded — those are Body)
        if (n.contains("clutch") || n.contains("sprocket") || n.contains("kick start")
                || n.contains("kick lever") || n.contains("gear lever") || n.contains("gear shaft")
                || (n.contains("chain") && !n.contains("chain cover") && !n.contains("chain guard"))) return 7L;

        // 8 — Tyres & Wheels
        if (n.contains("tyre") || n.contains("tire") || n.contains("inner tube")
                || n.contains("wheel") || n.contains("spoke") || n.contains("alloy")) return 8L;

        // 5 — Body & Frame
        if (n.contains("mudguard") || n.contains("fender") || n.contains("panel")
                || n.contains("seat") || n.contains("handlebar") || n.contains("mirror")
                || n.contains("footrest") || n.contains("foot peg") || n.contains("stand")
                || n.contains("guard") || n.contains("grip") || n.contains("number plate")
                || n.contains("chain cover") || n.contains("fairing") || n.contains("cowl")
                || n.contains("shroud") || n.contains("visor")) return 5L;

        // 1 — Engine (piston, crankshaft, camshaft, valve, cylinder, bearing, etc.)
        return 1L;
    }

    private void persistAlias(Part part, String text, SearchAlias.AliasType type, String lang) {
        String trimmed = text.substring(0, Math.min(text.length(), 500));
        SearchAlias a = new SearchAlias();
        a.setPart(part);
        a.setAlias(trimmed);
        a.setAliasType(type);
        a.setLanguage(lang);
        em.persist(a);
    }

    private static SearchAlias.AliasType inferType(String alias) {
        String lower = alias.toLowerCase();
        if (lower.contains("nahi") || lower.contains("tapakna") || lower.contains("kharab")
                || lower.contains("slip") || lower.contains("leak") || lower.contains("nahi aa")) {
            return SearchAlias.AliasType.SYMPTOM;
        }
        if (isHindi(alias)) return SearchAlias.AliasType.HINDI;
        return SearchAlias.AliasType.SLANG;
    }

    // Heuristic: contains common Hindi/Hinglish words
    private static boolean isHindi(String s) {
        String l = s.toLowerCase();
        return l.contains("nahi") || l.contains("taar") || l.contains("tel")
            || l.contains("batti") || l.contains("aage") || l.contains("piche")
            || l.contains("agla") || l.contains("aaina") || l.contains("gaddi")
            || l.contains("petrol") || l.contains("tank") || l.contains("tabbdil")
            || l.contains("kanta") || l.contains("zanjeer") || l.contains("chakri")
            || l.contains("batri") || l.contains("masala") || l.contains("bujji")
            || l.contains("jali") || l.contains("hawa") || l.contains("lining")
            || l.contains("pistn") || l.contains("shokr") || l.contains("carbi");
    }

    private static String str(Object o) {
        if (o == null) return null;
        String s = o.toString().trim();
        return s.isEmpty() ? null : s;
    }

    private static BigDecimal toBD(Object o) {
        if (o == null) return null;
        try { return new BigDecimal(o.toString()); } catch (NumberFormatException e) { return null; }
    }
}
