package com.bourse.tracker.domain;

import lombok.*;

import java.io.Serializable;
import java.time.LocalDate;

@Getter @Setter @NoArgsConstructor @AllArgsConstructor @EqualsAndHashCode
public class QuoteId implements Serializable {
    private String ticker;
    private LocalDate date;
}
