package com.hero.parts.dto;

import jakarta.validation.constraints.*;
import lombok.*;

@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class DealerDTO {
    private Long id;

    @NotBlank @Size(max = 30)
    private String dealerCode;

    @NotBlank @Size(max = 200)
    private String name;

    @Size(max = 100)
    private String contactName;

    @Pattern(regexp = "^[6-9]\\d{9}$", message = "Invalid Indian mobile number")
    private String phone;

    @Email
    private String email;

    @Size(max = 100)
    private String city;

    @Size(max = 100)
    private String state;

    @Pattern(regexp = "^\\d{6}$", message = "Invalid pincode")
    private String pincode;

    private Boolean active;
}