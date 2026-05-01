package com.bourse.tracker.domain;

import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;

@Entity
@Table(name = "instrument_annual_dividend")
@IdClass(InstrumentAnnualDividendId.class)
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class InstrumentAnnualDividend {

    @Id
    @Column(length = 20)
    private String ticker;

    @Id
    @Column(columnDefinition = "SMALLINT")
    private Short year;

    @Column(name = "annual_dividend", nullable = false, precision = 18, scale = 6)
    private BigDecimal annualDividend;
}
