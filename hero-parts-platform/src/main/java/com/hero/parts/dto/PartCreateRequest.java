package com.hero.parts.dto;

import jakarta.validation.constraints.*;
import lombok.*;

import java.math.BigDecimal;

@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class PartCreateRequest {

    @NotBlank(message = "SKU is required")
    @Size(max = 50)
    private String sku;

    @NotBlank(message = "Name is required")
    @Size(max = 200)
    private String name;

    @Size(max = 200)
    private String hindiName;

    private String description;

    private Long categoryId;

    @DecimalMin(value = "0.0", inclusive = false)
    private BigDecimal price;

    @DecimalMin(value = "0.0", inclusive = false)
    private BigDecimal mrp;

    @Size(max = 20)
    private String unit;

    @Size(max = 500)
    private String compatibleModels;

    @Size(max = 500)
    private String eshopUrl;

    @Size(max = 500)
    private String imageUrl;

    private Boolean inStock;

    @Min(0)
    private Integer stockQty;
}