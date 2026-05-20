package com.hero.parts.util;

import com.hero.parts.dto.CategoryDTO;
import com.hero.parts.dto.DealerDTO;
import com.hero.parts.dto.PartDTO;
import com.hero.parts.dto.SearchResponse.SearchResultItem;
import com.hero.parts.model.Category;
import com.hero.parts.model.Dealer;
import com.hero.parts.model.Part;
import com.hero.parts.model.SearchAlias;
import org.springframework.stereotype.Component;

import java.util.Collections;
import java.util.List;
import java.util.stream.Collectors;

@Component
public class PartMapper {

    public PartDTO toDTO(Part part) {
        List<PartDTO.AliasDTO> aliasDTOs = part.getAliases() == null ? Collections.emptyList() :
                part.getAliases().stream().map(this::toAliasDTO).collect(Collectors.toList());

        return PartDTO.builder()
                .id(part.getId())
                .sku(part.getSku())
                .name(part.getName())
                .hindiName(part.getHindiName())
                .description(part.getDescription())
                .categoryId(part.getCategory() != null ? part.getCategory().getId() : null)
                .categoryName(part.getCategory() != null ? part.getCategory().getName() : null)
                .price(part.getPrice())
                .mrp(part.getMrp())
                .unit(part.getUnit())
                .compatibleModels(part.getCompatibleModels())
                .eshopUrl(part.getEshopUrl())
                .imageUrl(part.getImageUrl())
                .inStock(part.getInStock())
                .stockQty(part.getStockQty())
                .aliases(aliasDTOs)
                .build();
    }

    private PartDTO.AliasDTO toAliasDTO(SearchAlias alias) {
        return PartDTO.AliasDTO.builder()
                .id(alias.getId())
                .alias(alias.getAlias())
                .aliasType(alias.getAliasType().name())
                .language(alias.getLanguage())
                .build();
    }

    public SearchResultItem toSearchResult(Part part, String matchedAlias,
                                           String matchedAliasType, double score) {
        return SearchResultItem.builder()
                .sku(part.getSku())
                .name(part.getName())
                .hindiName(part.getHindiName())
                .description(part.getDescription())
                .categoryName(part.getCategory() != null ? part.getCategory().getName() : null)
                .price(part.getPrice())
                .mrp(part.getMrp())
                .unit(part.getUnit())
                .compatibleModels(part.getCompatibleModels())
                .eshopUrl(part.getEshopUrl())
                .imageUrl(part.getImageUrl())
                .inStock(part.getInStock())
                .stockQty(part.getStockQty())
                .matchedAlias(matchedAlias)
                .matchedAliasType(matchedAliasType)
                .relevanceScore(score)
                .build();
    }

    public CategoryDTO toCategoryDTO(Category category, long partCount) {
        List<CategoryDTO> subDTOs = category.getSubCategories() == null ? Collections.emptyList() :
                category.getSubCategories().stream()
                        .map(c -> toCategoryDTO(c, 0))
                        .collect(Collectors.toList());

        return CategoryDTO.builder()
                .id(category.getId())
                .name(category.getName())
                .description(category.getDescription())
                .parentId(category.getParent() != null ? category.getParent().getId() : null)
                .parentName(category.getParent() != null ? category.getParent().getName() : null)
                .subCategories(subDTOs)
                .partCount(partCount)
                .build();
    }

    public DealerDTO toDealerDTO(Dealer dealer) {
        return DealerDTO.builder()
                .id(dealer.getId())
                .dealerCode(dealer.getDealerCode())
                .name(dealer.getName())
                .contactName(dealer.getContactName())
                .phone(dealer.getPhone())
                .email(dealer.getEmail())
                .city(dealer.getCity())
                .state(dealer.getState())
                .pincode(dealer.getPincode())
                .active(dealer.getActive())
                .build();
    }
}