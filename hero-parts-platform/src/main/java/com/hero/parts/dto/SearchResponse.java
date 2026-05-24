package com.hero.parts.dto;

import lombok.*;

import java.util.List;

@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class SearchResponse {

    private String query;
    private String matchType;
    private int totalResults;
    private int page;
    private int size;
    private List<SearchResultItem> results;
    private String identifiedAs;
    private List<String> suggestions;

    @Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
    public static class SearchResultItem {
        private String sku;
        private String name;
        private String hindiName;
        private String description;
        private String categoryName;
        private java.math.BigDecimal price;
        private java.math.BigDecimal mrp;
        private String unit;
        private String compatibleModels;
        private String eshopUrl;
        private String imageUrl;
        private Boolean inStock;
        private Integer stockQty;
        private String matchedAlias;
        private String matchedAliasType;
        private double relevanceScore;
    }
}