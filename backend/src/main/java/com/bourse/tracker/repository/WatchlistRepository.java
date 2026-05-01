package com.bourse.tracker.repository;

import com.bourse.tracker.domain.WatchlistItem;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.UUID;

public interface WatchlistRepository extends JpaRepository<WatchlistItem, UUID> {
    List<WatchlistItem> findByPortfolioIdAndActiveTrue(UUID portfolioId);
    List<WatchlistItem> findByActiveTrue();
}
