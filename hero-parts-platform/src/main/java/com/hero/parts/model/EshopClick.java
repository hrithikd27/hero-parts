package com.hero.parts.model;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;

@Entity
@Table(name = "eshop_clicks")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class EshopClick {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "part_sku", length = 50)
    private String partSku;

    @Column(name = "part_name", length = 500)
    private String partName;

    @Column(name = "eshop_url", length = 500)
    private String eshopUrl;

    @Column(name = "session_id", length = 64)
    private String sessionId;

    @CreationTimestamp
    @Column(name = "clicked_at", updatable = false)
    private LocalDateTime clickedAt;
}
