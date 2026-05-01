package com.bourse.tracker.repository;

import com.bourse.tracker.domain.Quote;
import com.bourse.tracker.domain.QuoteId;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

public interface QuoteRepository extends JpaRepository<Quote, QuoteId> {

    @Query("SELECT q FROM Quote q WHERE q.ticker = :ticker ORDER BY q.date DESC LIMIT 1")
    Optional<Quote> findLatestByTicker(String ticker);

    List<Quote> findByTickerAndDateBetweenOrderByDate(String ticker, LocalDate from, LocalDate to);
}
