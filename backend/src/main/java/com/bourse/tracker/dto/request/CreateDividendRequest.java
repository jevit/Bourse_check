package com.bourse.tracker.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import jakarta.validation.constraints.PositiveOrZero;

import java.math.BigDecimal;
import java.time.LocalDate;

public record CreateDividendRequest(
        @NotBlank String ticker,
        String instrumentName,
        @NotNull LocalDate exDividendDate,
        LocalDate paymentDate,
        @NotNull @Positive BigDecimal amountPerShare,
        @Positive BigDecimal quantity,
        String currency,
        @PositiveOrZero BigDecimal taxWithheld
) {}
