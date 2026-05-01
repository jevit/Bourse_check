package com.bourse.tracker.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record CreateInstrumentRequest(
        @NotBlank @Size(max = 20) String ticker,
        @NotBlank @Size(max = 200) String name,
        @Size(max = 12) String isin,
        String type,
        @Size(max = 3) String currency,
        String exchange,
        String sector,
        @Size(max = 2) String country
) {}
