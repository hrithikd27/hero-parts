package com.hero.parts.dto;

import lombok.*;

import java.math.BigDecimal;
import java.util.List;

@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class PartDTO {
    private Long id;
    private String sku;
    private String name;
    private String hindiName;
    private String description;
    private Long categoryId;
    private String categoryName;
    private BigDecimal price;
    private BigDecimal mrp;
    private String unit;
    private String compatibleModels;
    private String eshopUrl;
    private String imageUrl;
    private Boolean inStock;
    private Integer stockQty;
    private List<AliasDTO> aliases;

    @Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
    public static class AliasDTO {
        private Long id;
        private String alias;
        private String aliasType;
        private String language;
    }
}