package com.bourse.tracker.service;

import com.bourse.tracker.domain.WatchlistItem;
import com.bourse.tracker.repository.WatchlistRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class WatchlistService {

    private final WatchlistRepository watchlistRepository;
    private final InstrumentService instrumentService;

    public List<WatchlistItem> findByPortfolio(UUID portfolioId) {
        return watchlistRepository.findByPortfolioIdAndActiveTrue(portfolioId);
    }

    @Transactional
    public WatchlistItem add(UUID portfolioId, String ticker, String instrumentName,
                              BigDecimal targetPrice, BigDecimal maxWeightPct, String notes) {
        instrumentService.findOrCreate(ticker, instrumentName);
        WatchlistItem item = WatchlistItem.builder()
                .ticker(ticker.toUpperCase())
                .portfolioId(portfolioId)
                .targetPrice(targetPrice)
                .maxWeightPct(maxWeightPct != null ? maxWeightPct : new BigDecimal("5.0"))
                .notes(notes)
                .active(true)
                .build();
        return watchlistRepository.save(item);
    }

    @Transactional
    public void remove(UUID portfolioId, UUID itemId) {
        WatchlistItem item = watchlistRepository.findById(itemId)
                .orElseThrow(() -> new IllegalArgumentException("Watchlist item not found"));
        item.setActive(false);
        watchlistRepository.save(item);
    }

    @Transactional
    public WatchlistItem update(UUID id, BigDecimal targetPrice, BigDecimal maxWeightPct, String notes) {
        WatchlistItem item = watchlistRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Watchlist item not found"));
        if (targetPrice != null) item.setTargetPrice(targetPrice);
        if (maxWeightPct != null) item.setMaxWeightPct(maxWeightPct);
        if (notes != null) item.setNotes(notes);
        return watchlistRepository.save(item);
    }
}
