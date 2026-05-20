package com.hero.parts.model;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "search_logs")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class SearchLog {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, length = 300)
    private String query;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "dealer_id")
    private Dealer dealer;

    @Column(name = "results_count")
    private Integer resultsCount;

    @Column(name = "top_part_sku", length = 50)
    private String topPartSku;

    @Enumerated(EnumType.STRING)
    @Column(name = "match_type", length = 30)
    private MatchType matchType;

    @Column(name = "source", length = 10)
    private String source;   // "text" or "voice"

    @Column(name = "session_id", length = 64)
    private String sessionId;

    @Column(name = "searched_at", updatable = false)
    private LocalDateTime searchedAt;

    @PrePersist
    protected void onCreate() {
        searchedAt = LocalDateTime.now();
    }

    public enum MatchType {
        EXACT_SKU, EXACT_NAME, ALIAS, FUZZY, NO_RESULT
    }
}