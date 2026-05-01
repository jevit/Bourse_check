package com.bourse.tracker.dto.request;

import com.bourse.tracker.enums.AlertDirection;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;

import java.math.BigDecimal;
import java.util.UUID;

public record CreateAlertRequest(
        @NotBlank String ticker,
        UUID portfolioId,
        @NotNull AlertDirection direction,
        @NotNull @Positive BigDecimal targetPrice
) {}
