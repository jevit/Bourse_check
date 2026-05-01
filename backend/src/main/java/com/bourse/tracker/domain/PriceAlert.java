package com.bourse.tracker.domain;

import com.bourse.tracker.enums.AlertDirection;
import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;
import java.time.OffsetDateTime;
import java.util.UUID;

@Entity
@Table(name = "price_alert")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class PriceAlert {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(nullable = false, length = 20)
    private String ticker;

    @Column(name = "portfolio_id")
    private UUID portfolioId;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 10)
    private AlertDirection direction;

    @Column(name = "target_price", nullable = false, precision = 18, scale = 6)
    private BigDecimal targetPrice;

    @Column(name = "is_active", nullable = false)
    private boolean active = true;

    @Column(name = "triggered_at")
    private OffsetDateTime triggeredAt;

    @Column(name = "created_at", nullable = false, updatable = false)
    private OffsetDateTime createdAt;

    @PrePersist
    void prePersist() {
        createdAt = OffsetDateTime.now();
    }
}
