package com.bourse.tracker.dto.request;

import com.bourse.tracker.enums.EnveloppeType;
import com.bourse.tracker.enums.TransactionType;
import jakarta.validation.constraints.*;

import java.math.BigDecimal;
import java.time.LocalDate;

public record CreateTransactionRequest(
        @NotBlank String ticker,
        String instrumentName,
        @NotNull EnveloppeType enveloppe,
        @NotNull TransactionType type,
        @NotNull LocalDate date,
        @NotNull @Positive BigDecimal quantity,
        @NotNull @PositiveOrZero BigDecimal unitPrice,
        @PositiveOrZero BigDecimal fees,
        String currency,
        String notes
) {}
