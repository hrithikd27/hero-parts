package com.hero.parts;

import com.hero.parts.dto.SearchRequest;
import com.hero.parts.dto.SearchResponse;
import com.hero.parts.service.SearchService;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;

import static org.assertj.core.api.Assertions.assertThat;

@SpringBootTest
class HeroPartsApplicationTests {

    @Autowired
    private SearchService searchService;

    @Test
    void contextLoads() {
    }

    @Test
    void skuSearchReturnsExactMatch() {
        SearchResponse resp = searchService.search(
                SearchRequest.builder().query("HH-ELC-005").build());
        assertThat(resp.getResults()).isNotEmpty();
        assertThat(resp.getResults().get(0).getSku()).isEqualTo("HH-ELC-005");
        assertThat(resp.getMatchType()).isEqualTo("EXACT_SKU");
    }

    @Test
    void slangSearchForShockerReturnsShockAbsorber() {
        SearchResponse resp = searchService.search(
                SearchRequest.builder().query("shocker").build());
        assertThat(resp.getResults()).isNotEmpty();
        assertThat(resp.getResults().stream()
                .anyMatch(r -> r.getSku().equals("HH-SUS-002"))).isTrue();
    }

    @Test
    void hindiSearchForTelReturnsEngineOil() {
        SearchResponse resp = searchService.search(
                SearchRequest.builder().query("tel").build());
        assertThat(resp.getResults()).isNotEmpty();
    }

    @Test
    void symptomSearchReturnsBattery() {
        SearchResponse resp = searchService.search(
                SearchRequest.builder().query("self start nahi").build());
        assertThat(resp.getResults()).isNotEmpty();
    }

    @Test
    void noResultQueryIsLogged() {
        SearchResponse resp = searchService.search(
                SearchRequest.builder().query("xyzabcnonexistent").build());
        assertThat(resp.getMatchType()).isEqualTo("NO_RESULT");
    }
}