package com.hero.parts.model;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "search_aliases")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class SearchAlias {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "part_id", nullable = false)
    private Part part;

    @Column(nullable = false, length = 500)
    private String alias;

    @Enumerated(EnumType.STRING)
    @Column(name = "alias_type", nullable = false, length = 30)
    private AliasType aliasType;

    @Column(length = 10)
    private String language;

    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
    }

    public enum AliasType {
        HINDI, SLANG, PHONETIC, SYMPTOM, COLOR, MODEL_SLANG
    }
}