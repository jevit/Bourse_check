package com.bourse.tracker.domain;

import lombok.*;

import java.io.Serializable;

@Getter @Setter @NoArgsConstructor @AllArgsConstructor @EqualsAndHashCode
public class InstrumentAnnualDividendId implements Serializable {
    private String ticker;
    private Short year;
}
