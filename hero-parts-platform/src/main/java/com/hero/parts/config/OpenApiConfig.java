package com.hero.parts.config;

import io.swagger.v3.oas.models.OpenAPI;
import io.swagger.v3.oas.models.info.Contact;
import io.swagger.v3.oas.models.info.Info;
import io.swagger.v3.oas.models.info.License;
import io.swagger.v3.oas.models.servers.Server;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import java.util.List;

@Configuration
public class OpenApiConfig {

    @Bean
    public OpenAPI heroPartsOpenAPI() {
        return new OpenAPI()
                .info(new Info()
                        .title("Hero Parts Platform API")
                        .description("B2B Parts Search Platform for Hero MotoCorp Dealers and Service Technicians. " +
                                "Bridges the gap between technical SKU names and local Hindi names, workshop slang, " +
                                "phonetic misspellings, colour words, and symptom descriptions.")
                        .version("1.0.0")
                        .contact(new Contact()
                                .name("Hero Parts Platform Team")
                                .email("support@heroparts.in"))
                        .license(new License().name("Proprietary")))
                .servers(List.of(
                        new Server().url("http://localhost:8080").description("Local Development")
                ));
    }
}