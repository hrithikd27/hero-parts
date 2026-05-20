package com.hero.parts.controller;

import com.hero.parts.dto.ApiResponse;
import com.hero.parts.model.EshopClick;
import com.hero.parts.repository.EshopClickRepository;
import com.hero.parts.service.AnalyticsService;
import com.hero.parts.service.SearchService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/v1/analytics")
@RequiredArgsConstructor
@Tag(name = "Analytics", description = "Search analytics and zero-result query reports")
public class AnalyticsController {

    private final AnalyticsService analyticsService;
    private final EshopClickRepository clickRepository;
    private final SearchService searchService;

    @GetMapping("/top-searches")
    @Operation(summary = "Top searched terms")
    public ResponseEntity<ApiResponse<Map<String, Long>>> topSearches(
            @RequestParam(defaultValue = "20") int limit) {
        return ResponseEntity.ok(ApiResponse.ok(analyticsService.getTopSearchTerms(limit)));
    }

    @GetMapping("/zero-results")
    @Operation(
        summary = "Top queries that returned no results",
        description = "Use this to discover new aliases that should be added to the catalogue."
    )
    public ResponseEntity<ApiResponse<Map<String, Long>>> zeroResults(
            @RequestParam(defaultValue = "20") int limit) {
        return ResponseEntity.ok(ApiResponse.ok(analyticsService.getTopNoResultQueries(limit)));
    }

    @PostMapping("/eshop-click")
    @Operation(summary = "Record a Buy-on-eShop click")
    public ResponseEntity<ApiResponse<Void>> recordClick(@RequestBody Map<String, String> body) {
        EshopClick click = EshopClick.builder()
                .partSku(body.get("partSku"))
                .partName(body.get("partName"))
                .eshopUrl(body.get("eshopUrl"))
                .sessionId(body.get("sessionId"))
                .build();
        clickRepository.save(click);
        return ResponseEntity.ok(ApiResponse.ok(null));
    }

    @GetMapping("/eshop-clicks")
    @Operation(summary = "Top parts clicked through to eShop")
    public ResponseEntity<ApiResponse<List<Map<String, Object>>>> topClicks(
            @RequestParam(defaultValue = "50") int limit) {
        List<Object[]> rows = clickRepository.findTopClickedParts();
        List<Map<String, Object>> result = rows.stream().limit(limit).map(r -> {
            Map<String, Object> m = new LinkedHashMap<>();
            m.put("partSku", r[0]);
            m.put("partName", r[1]);
            m.put("clicks", ((Number) r[2]).longValue());
            return m;
        }).toList();
        return ResponseEntity.ok(ApiResponse.ok(result));
    }

    @GetMapping("/stats")
    @Operation(summary = "Search volume stats")
    public ResponseEntity<ApiResponse<Map<String, Object>>> stats() {
        Map<String, Object> stats = new LinkedHashMap<>();
        stats.put("last24Hours", analyticsService.getSearchCountLast24Hours());
        stats.put("last7Days", analyticsService.getSearchCountLast7Days());
        stats.put("bySource", analyticsService.getSearchCountBySource());
        return ResponseEntity.ok(ApiResponse.ok(stats));
    }

    @GetMapping("/voice-searches")
    @Operation(summary = "Top queries submitted via voice search")
    public ResponseEntity<ApiResponse<Map<String, Long>>> voiceSearches(
            @RequestParam(defaultValue = "20") int limit) {
        return ResponseEntity.ok(ApiResponse.ok(analyticsService.getTopVoiceQueries(limit)));
    }

    /**
     * Called by the frontend after the user has been idle for 1.5 s — records one log entry
     * per "committed" search instead of logging every 300 ms debounce tick.
     */
    @PostMapping("/search-event")
    @Operation(summary = "Commit a completed search to the log")
    public ResponseEntity<ApiResponse<Void>> searchEvent(@RequestBody Map<String, String> body) {
        int count = 0;
        try { count = Integer.parseInt(body.getOrDefault("resultsCount", "0")); } catch (NumberFormatException ignored) {}
        searchService.commitSearchLog(
                body.get("rawQuery"),
                body.get("translatedQuery"),
                body.getOrDefault("source", "text"),
                body.get("sessionId"),
                count
        );
        return ResponseEntity.ok(ApiResponse.ok(null));
    }
}