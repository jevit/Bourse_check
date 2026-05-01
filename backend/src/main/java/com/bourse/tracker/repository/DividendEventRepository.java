package com.bourse.tracker.repository;

import com.bourse.tracker.domain.DividendEvent;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

public interface DividendEventRepository extends JpaRepository<DividendEvent, UUID> {

    List<DividendEvent> findByPortfolioIdOrderByExDividendDateDesc(UUID portfolioId);

    List<DividendEvent> findByPortfolioIdAndExDividendDateBetweenOrderByExDividendDate(
            UUID portfolioId, LocalDate from, LocalDate to);

    @Query("SELECT d FROM DividendEvent d WHERE d.portfolioId = :portfolioId AND d.ticker = :ticker ORDER BY d.exDividendDate DESC")
    List<DividendEvent> findByPortfolioIdAndTicker(UUID portfolioId, String ticker);
}
