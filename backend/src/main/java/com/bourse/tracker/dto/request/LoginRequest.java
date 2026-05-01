package com.bourse.tracker.dto.request;

import jakarta.validation.constraints.NotBlank;

public record LoginRequest(@NotBlank String username, @NotBlank String password) {}
