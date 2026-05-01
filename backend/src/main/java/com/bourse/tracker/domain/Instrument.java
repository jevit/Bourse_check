package com.bourse.tracker.domain;

import jakarta.persistence.*;
import lombok.*;

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
}
