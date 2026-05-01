package com.bourse.tracker.repository;

import com.bourse.tracker.domain.Transaction;
import com.bourse.tracker.enums.TransactionType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.util.List;
import java.util.UUID;

public interface TransactionRepository extends JpaRepository<Transaction, UUID> {

    List<Transaction> findByPortfolioIdOrderByDateDesc(UUID portfolioId);

    List<Transaction> findByPortfolioIdAndTickerOrderByDate(UUID portfolioId, String ticker);

    List<Transaction> findByPortfolioIdAndTickerAndTypeOrderByDate(UUID portfolioId, String ticker, TransactionType type);

    @Query("SELECT DISTINCT t.ticker FROM Transaction t WHERE t.portfolioId = :portfolioId")
    List<String> findDistinctTickersByPortfolioId(UUID portfolioId);
}
