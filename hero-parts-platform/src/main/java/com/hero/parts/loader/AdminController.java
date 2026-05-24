package com.hero.parts.loader;

import com.hero.parts.dto.ApiResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.jdbc.core.RowCallbackHandler;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/v1/admin")
@RequiredArgsConstructor
public class AdminController {

    private final ScrapedPartsLoader loader;
    private final JdbcTemplate jdbc;

    @GetMapping("/load-scraped")
    public ResponseEntity<ApiResponse<Map<String, Object>>> loadScraped() {
        ScrapedPartsLoader.LoadResult result = loader.loadAll();
        if (result.error() != null) {
            return ResponseEntity.badRequest().body(ApiResponse.error(result.error()));
        }
        return ResponseEntity.ok(ApiResponse.ok(Map.of(
            "inserted", result.inserted(),
            "skipped",  result.skipped()
        )));
    }

    /** GET /api/v1/admin/load-from-json?path=<absolute-path-to-parts.json> */
    @GetMapping("/load-from-json")
    public ResponseEntity<ApiResponse<Map<String, Object>>> loadFromJson(
            @RequestParam String path) {
        ScrapedPartsLoader.LoadResult result = loader.loadFromJson(path);
        if (result.error() != null) {
            return ResponseEntity.badRequest().body(ApiResponse.error(result.error()));
        }
        return ResponseEntity.ok(ApiResponse.ok(Map.of(
            "inserted", result.inserted(),
            "skipped",  result.skipped()
        )));
    }

    /** GET /api/v1/admin/export/parts.csv */
    @GetMapping("/export/parts.csv")
    public ResponseEntity<String> exportParts() {
        StringBuilder csv = new StringBuilder(
            "sku,name,category,price,mrp,in_stock,compatible_models,eshop_url\n");
        jdbc.query(
            "SELECT p.sku, p.name, COALESCE(c.name,''), p.price, p.mrp, " +
            "p.in_stock, COALESCE(p.compatible_models,''), COALESCE(p.eshop_url,'') " +
            "FROM parts p LEFT JOIN categories c ON p.category_id = c.id ORDER BY p.sku",
            (RowCallbackHandler) rs -> csv.append(q(rs.getString(1))).append(',')
                     .append(q(rs.getString(2))).append(',')
                     .append(q(rs.getString(3))).append(',')
                     .append(rs.getString(4)).append(',')
                     .append(rs.getString(5)).append(',')
                     .append(rs.getBoolean(6)).append(',')
                     .append(q(rs.getString(7))).append(',')
                     .append(q(rs.getString(8))).append('\n'));
        return csvResponse(csv.toString(), "parts.csv");
    }

    /** GET /api/v1/admin/export/search-logs.csv */
    @GetMapping("/export/search-logs.csv")
    public ResponseEntity<String> exportSearchLogs() {
        StringBuilder csv = new StringBuilder(
            "id,query,results_count,match_type,source,session_id,searched_at\n");
        jdbc.query(
            "SELECT id, query, results_count, COALESCE(match_type,''), " +
            "COALESCE(source,'text'), COALESCE(session_id,''), searched_at " +
            "FROM search_logs ORDER BY searched_at DESC",
            (RowCallbackHandler) rs -> csv.append(rs.getLong(1)).append(',')
                     .append(q(rs.getString(2))).append(',')
                     .append(rs.getInt(3)).append(',')
                     .append(q(rs.getString(4))).append(',')
                     .append(q(rs.getString(5))).append(',')
                     .append(q(rs.getString(6))).append(',')
                     .append(rs.getString(7)).append('\n'));
        return csvResponse(csv.toString(), "search-logs.csv");
    }

    /** GET /api/v1/admin/export/eshop-clicks.csv */
    @GetMapping("/export/eshop-clicks.csv")
    public ResponseEntity<String> exportEshopClicks() {
        StringBuilder csv = new StringBuilder(
            "id,part_sku,part_name,eshop_url,session_id,clicked_at\n");
        jdbc.query(
            "SELECT id, COALESCE(part_sku,''), COALESCE(part_name,''), " +
            "COALESCE(eshop_url,''), COALESCE(session_id,''), clicked_at " +
            "FROM eshop_clicks ORDER BY clicked_at DESC",
            (RowCallbackHandler) rs -> csv.append(rs.getLong(1)).append(',')
                     .append(q(rs.getString(2))).append(',')
                     .append(q(rs.getString(3))).append(',')
                     .append(q(rs.getString(4))).append(',')
                     .append(q(rs.getString(5))).append(',')
                     .append(rs.getString(6)).append('\n'));
        return csvResponse(csv.toString(), "eshop-clicks.csv");
    }

    // RFC-4180 CSV quoting: wrap in double-quotes, escape inner quotes
    private static String q(String s) {
        if (s == null) return "\"\"";
        return "\"" + s.replace("\"", "\"\"") + "\"";
    }

    private static ResponseEntity<String> csvResponse(String body, String filename) {
        return ResponseEntity.ok()
            .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"" + filename + "\"")
            .contentType(MediaType.parseMediaType("text/csv; charset=UTF-8"))
            .body(body);
    }
}
