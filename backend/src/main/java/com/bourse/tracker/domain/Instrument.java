package com.bourse.tracker.domain;

import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;

@Entity
@Table(name = "instrument")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class Instrument {

    @Id
    @Column(length = 20)
    private String ticker;

    @Column(nullable = false, length = 200)
    private String name;

    @Column(length = 12)
    private String isin;

    @Column(nullable = false, length = 20)
    private String type = "STOCK";

    @Column(length = 3, nullable = false)
    private String currency = "EUR";

    @Column(length = 20)
    private String exchange;

    @Column(length = 100)
    private String sector;

    @Column(length = 2)
    private String country;

    // Fondamentaux (V2)
    @Column(name = "payout_ratio", precision = 5, scale = 2)
    private BigDecimal payoutRatio;

    @Column(name = "dividend_years")
    private Integer dividendYears;

    @Column(name = "five_year_dgr", precision = 6, scale = 4)
    private BigDecimal fiveYearDgr;

    @Column(columnDefinition = "TEXT")
    private String notes;

    // Cache analyse (V3)
    @Column(name = "hist_avg_yield", precision = 8, scale = 4)
    private BigDecimal histAvgYield;

    @Column(name = "current_yield", precision = 8, scale = 4)
    private BigDecimal currentYield;
}
