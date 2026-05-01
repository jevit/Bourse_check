package com.bourse.tracker.domain;

import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.OffsetDateTime;

@Entity
@Table(name = "quote")
@IdClass(QuoteId.class)
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class Quote {

    @Id
    @Column(length = 20)
    private String ticker;

    @Id
    private LocalDate date;

    @Column(name = "close_price", nullable = false, precision = 18, scale = 6)
    private BigDecimal closePrice;

    @Column(length = 3, nullable = false)
    private String currency = "EUR";

    @Column(length = 50, nullable = false)
    private String source = "YAHOO";

    @Column(name = "fetched_at", nullable = false)
    private OffsetDateTime fetchedAt;

    @PrePersist @PreUpdate
    void prePersist() {
        fetchedAt = OffsetDateTime.now();
    }
}
