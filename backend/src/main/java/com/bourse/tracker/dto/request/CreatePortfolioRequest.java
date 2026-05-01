package com.bourse.tracker.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record CreatePortfolioRequest(
        @NotBlank @Size(max = 100) String name,
        String description,
        String currency
) {}
