package com.bourse.tracker.dto.request;

import com.bourse.tracker.enums.EnveloppeType;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;

import java.math.BigDecimal;
import java.time.LocalDate;

public record TaxSimulationRequest(
        @NotBlank String ticker,
        @NotNull @Positive BigDecimal sellQuantity,
        @NotNull @Positive BigDecimal sellPrice,
        @NotNull EnveloppeType enveloppe,
        LocalDate openDate
) {}
