package com.bourse.tracker.repository;

import com.bourse.tracker.domain.PriceAlert;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.UUID;

public interface PriceAlertRepository extends JpaRepository<PriceAlert, UUID> {

    List<PriceAlert> findByActiveTrue();

    List<PriceAlert> findByPortfolioIdOrderByCreatedAtDesc(UUID portfolioId);

    List<PriceAlert> findAll();
}
