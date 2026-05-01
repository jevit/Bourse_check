package com.bourse.tracker.domain;

import com.bourse.tracker.enums.EnveloppeType;
import com.bourse.tracker.enums.TransactionType;
import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.OffsetDateTime;
import java.util.UUID;

@Entity
@Table(name = "transaction")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class Transaction {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(name = "portfolio_id", nullable = false)
    private UUID portfolioId;

    @Column(nullable = false, length = 20)
    private String ticker;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 10)
    private EnveloppeType enveloppe;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private TransactionType type;

    @Column(nullable = false)
    private LocalDate date;

    @Column(nullable = false, precision = 18, scale = 6)
    private BigDecimal quantity;

    @Column(name = "unit_price", nullable = false, precision = 18, scale = 6)
    private BigDecimal unitPrice;

    @Column(nullable = false, precision = 18, scale = 6)
    private BigDecimal fees = BigDecimal.ZERO;

    @Column(length = 3, nullable = false)
    private String currency = "EUR";

    @Column(columnDefinition = "TEXT")
    private String notes;

    @Column(name = "created_at", nullable = false, updatable = false)
    private OffsetDateTime createdAt;

    @PrePersist
    void prePersist() {
        createdAt = OffsetDateTime.now();
        if (fees == null) fees = BigDecimal.ZERO;
    }
}
