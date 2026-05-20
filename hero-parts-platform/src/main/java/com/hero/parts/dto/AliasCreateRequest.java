package com.hero.parts.dto;

import com.hero.parts.model.SearchAlias.AliasType;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.*;

@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class AliasCreateRequest {

    @NotNull
    private Long partId;

    @NotBlank @Size(max = 200)
    private String alias;

    @NotNull
    private AliasType aliasType;

    @Size(max = 10)
    private String language;
}