package com.hero.parts.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.*;

@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class SearchRequest {

    @NotBlank(message = "Search query cannot be blank")
    @Size(min = 2, max = 200, message = "Query must be between 2 and 200 characters")
    private String query;

    private Long dealerId;

    private Long categoryId;

    private Boolean inStockOnly;

    private Integer page;

    private Integer size;

    /** Bike model name filter, e.g. "Splendor Plus". Null / "All Models" = no filter. */
    private String model;

    /** "text" or "voice" — set by the frontend to distinguish typed vs mic searches */
    private String source;

    private String sessionId;
}