package com.bourse.tracker.controller;

import com.bourse.tracker.domain.WatchlistItem;
import com.bourse.tracker.service.WatchlistService;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.PositiveOrZero;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/portfolios/{portfolioId}/watchlist")
@RequiredArgsConstructor
public class WatchlistController {

    private final WatchlistService watchlistService;

    @GetMapping
    public List<WatchlistItem> list(@PathVariable UUID portfolioId) {
        return watchlistService.findByPortfolio(portfolioId);
    }

    record AddRequest(
            @NotBlank String ticker,
            String instrumentName,
            @PositiveOrZero BigDecimal targetPrice,
            @PositiveOrZero BigDecimal maxWeightPct,
            String notes) {}

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public WatchlistItem add(@PathVariable UUID portfolioId, @Valid @RequestBody AddRequest req) {
        return watchlistService.add(portfolioId, req.ticker(), req.instrumentName(),
                req.targetPrice(), req.maxWeightPct(), req.notes());
    }

    @DeleteMapping("/{itemId}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void remove(@PathVariable UUID portfolioId, @PathVariable UUID itemId) {
        watchlistService.remove(portfolioId, itemId);
    }

    record UpdateRequest(BigDecimal targetPrice, BigDecimal maxWeightPct, String notes) {}

    @PutMapping("/{itemId}")
    public WatchlistItem update(@PathVariable UUID portfolioId,
                                 @PathVariable UUID itemId,
                                 @RequestBody UpdateRequest req) {
        return watchlistService.update(itemId, req.targetPrice(), req.maxWeightPct(), req.notes());
    }
}
