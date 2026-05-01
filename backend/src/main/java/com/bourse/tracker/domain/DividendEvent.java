package com.bourse.tracker.domain;

import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.OffsetDateTime;
import java.util.UUID;

@Entity
@Table(name = "dividend_event")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class DividendEvent {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(nullable = false, length = 20)
    private String ticker;

    @Column(name = "portfolio_id", nullable = false)
    private UUID portfolioId;

    @Column(name = "ex_dividend_date", nullable = false)
    private LocalDate exDividendDate;

    @Column(name = "payment_date")
    private LocalDate paymentDate;

    @Column(name = "amount_per_share", nullable = false, precision = 18, scale = 6)
    private BigDecimal amountPerShare;

    @Column(nullable = false, precision = 18, scale = 6)
    private BigDecimal quantity = BigDecimal.ONE;

    @Column(length = 3, nullable = false)
    private String currency = "EUR";

    @Column(name = "tax_withheld", nullable = false, precision = 18, scale = 6)
    private BigDecimal taxWithheld = BigDecimal.ZERO;

    @Column(name = "net_amount", nullable = false, precision = 18, scale = 6)
    private BigDecimal netAmount;

    @Column(name = "created_at", nullable = false, updatable = false)
    private OffsetDateTime createdAt;

    @PrePersist
    void prePersist() {
        createdAt = OffsetDateTime.now();
        if (taxWithheld == null) taxWithheld = BigDecimal.ZERO;
        if (quantity == null) quantity = BigDecimal.ONE;
    }
}
