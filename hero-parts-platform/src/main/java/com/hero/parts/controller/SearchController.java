package com.hero.parts.controller;

import com.hero.parts.dto.ApiResponse;
import com.hero.parts.dto.SearchRequest;
import com.hero.parts.dto.SearchResponse;
import com.hero.parts.service.SearchService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/search")
@RequiredArgsConstructor
@Validated
@Tag(name = "Search", description = "Parts search using Hindi names, slang, phonetic spellings, or symptoms")
public class SearchController {

    private final SearchService searchService;

    @GetMapping
    @Operation(
        summary = "Search parts",
        description = "Search using SKU, English/Hindi names, local slang, phonetic misspellings, " +
                      "colour descriptions, or symptom descriptions. Returns ranked results with Hero eShop links."
    )
    public ResponseEntity<ApiResponse<SearchResponse>> search(
            @RequestParam @NotBlank @Size(min = 2, max = 200)
            @Parameter(description = "Search query — SKU, name, Hindi name, slang, or symptom", example = "shocker")
            String q,

            @RequestParam(required = false)
            @Parameter(description = "Filter by category ID")
            Long categoryId,

            @RequestParam(required = false)
            @Parameter(description = "Show only in-stock parts")
            Boolean inStockOnly,

            @RequestParam(required = false)
            @Parameter(description = "Dealer ID for search logging")
            Long dealerId,

            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size,

            @RequestParam(required = false)
            @Parameter(description = "Bike model filter, e.g. 'Splendor Plus'")
            String model,

            @RequestParam(required = false)
            @Parameter(description = "Search channel: 'text' or 'voice'")
            String source,

            @RequestParam(required = false)
            @Parameter(description = "Session ID for analytics")
            String sessionId
    ) {
        SearchRequest req = SearchRequest.builder()
                .query(q)
                .categoryId(categoryId)
                .inStockOnly(inStockOnly)
                .dealerId(dealerId)
                .page(page)
                .size(size)
                .model(model)
                .source(source != null ? source : "text")
                .sessionId(sessionId)
                .build();
        return ResponseEntity.ok(ApiResponse.ok(searchService.search(req)));
    }

    @PostMapping
    @Operation(
        summary = "Search parts (POST)",
        description = "Same as GET /search but accepts a JSON body — useful for programmatic access."
    )
    public ResponseEntity<ApiResponse<SearchResponse>> searchPost(
            @Valid @RequestBody SearchRequest request) {
        return ResponseEntity.ok(ApiResponse.ok(searchService.search(request)));
    }

    @GetMapping("/suggest")
    @Operation(
        summary = "Autocomplete suggestions",
        description = "Returns up to 10 matching alias/name suggestions for a partial query — useful for live search-as-you-type."
    )
    public ResponseEntity<ApiResponse<List<String>>> suggest(
            @RequestParam @NotBlank @Size(min = 1, max = 100)
            @Parameter(description = "Partial search term", example = "sho")
            String q) {
        return ResponseEntity.ok(ApiResponse.ok(searchService.suggest(q)));
    }
}