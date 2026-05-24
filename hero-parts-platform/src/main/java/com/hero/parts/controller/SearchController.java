package com.hero.parts.controller;

import com.hero.parts.dto.ApiResponse;
import com.hero.parts.dto.SearchRequest;
import com.hero.parts.dto.SearchResponse;
import com.hero.parts.service.CloudVisionService;
import com.hero.parts.service.SearchService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.Collections;
import java.util.List;

@RestController
@RequestMapping("/api/v1/search")
@RequiredArgsConstructor
@Validated
@Slf4j
@Tag(name = "Search", description = "Parts search using Hindi names, slang, phonetic spellings, or symptoms")
public class SearchController {

    private final SearchService searchService;
    private final com.hero.parts.service.ClaudeService claudeService;
    private final CloudVisionService cloudVisionService;

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

    @GetMapping("/expand")
    @Operation(
        summary = "Expand a slang / Hindi query to a canonical English part name via Claude AI",
        description = "Accepts any language query and returns the best-matching English search term " +
                      "from the parts catalogue. Falls back to the original query if Claude is unavailable."
    )
    public ResponseEntity<ApiResponse<String>> expand(
            @RequestParam @NotBlank @Size(min = 1, max = 200)
            @Parameter(description = "Raw query in any language or slang", example = "garari")
            String q) {
        return ResponseEntity.ok(ApiResponse.ok(claudeService.expandSearchQuery(q)));
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

    @PostMapping(value = "/by-image", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @Operation(
        summary = "Identify and search a part by photo",
        description = "Upload a photo — Cloud Vision identifies the part and returns a list of possible names plus matching catalogue results."
    )
    public ResponseEntity<ApiResponse<SearchResponse>> searchByImage(
            @RequestParam("image") MultipartFile image) throws IOException {

        if (image.isEmpty()) {
            return ResponseEntity.badRequest().body(ApiResponse.error("No image provided"));
        }
        String contentType = image.getContentType();
        if (contentType == null || !contentType.startsWith("image/")) {
            return ResponseEntity.badRequest().body(ApiResponse.error("File must be an image (JPEG, PNG, or WebP)"));
        }

        List<String> labels = cloudVisionService.identifyPart(image.getBytes());
        log.info("[IMAGE-SEARCH] labels: {}", labels);

        if (labels.isEmpty()) {
            return ResponseEntity.status(503).body(
                ApiResponse.error("Image identification service unavailable — could not identify the part in this image.")
            );
        }

        if (CloudVisionService.NOT_A_PART.equals(labels.get(0))) {
            return ResponseEntity.status(422).body(
                ApiResponse.error("Please try with a relevant part photo — this image does not appear to contain a motorcycle or vehicle part.")
            );
        }

        String primaryTerm = labels.get(0);

        // Keyword-union search across all Vision labels
        SearchResponse results = searchService.searchByKeywords(labels, 24);
        log.info("[IMAGE-SEARCH] keyword search found {} parts", results.getTotalResults());

        // Fallback to ranked search if sparse
        if (results.getTotalResults() < 5) {
            SearchRequest fallback = SearchRequest.builder()
                .query(primaryTerm).page(0).size(24).source("image").build();
            SearchResponse ranked = searchService.search(fallback);
            log.info("[IMAGE-SEARCH] ranked fallback found {} parts", ranked.getTotalResults());
            if (ranked.getTotalResults() > results.getTotalResults()) results = ranked;
        }

        results.setIdentifiedAs(primaryTerm);
        results.setQuery(primaryTerm);
        results.setSuggestions(labels);

        searchService.logImageSearch(primaryTerm, results.getTotalResults());

        return ResponseEntity.ok(ApiResponse.ok(results));
    }
}
