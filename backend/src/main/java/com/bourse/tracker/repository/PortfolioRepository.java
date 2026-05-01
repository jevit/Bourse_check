package com.bourse.tracker.repository;

import com.bourse.tracker.domain.Portfolio;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.UUID;

public interface PortfolioRepository extends JpaRepository<Portfolio, UUID> {}
