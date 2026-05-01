package com.bourse.tracker.service;

import com.bourse.tracker.domain.Portfolio;
import com.bourse.tracker.repository.PortfolioRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class PortfolioService {

    private final PortfolioRepository portfolioRepository;

    public List<Portfolio> findAll() {
        return portfolioRepository.findAll();
    }

    public Portfolio findById(UUID id) {
        return portfolioRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Portfolio not found: " + id));
    }

    @Transactional
    public Portfolio create(String name, String description, String currency) {
        Portfolio p = Portfolio.builder()
                .name(name)
                .description(description)
                .currency(currency != null ? currency : "EUR")
                .build();
        return portfolioRepository.save(p);
    }

    @Transactional
    public Portfolio update(UUID id, String name, String description, String currency) {
        Portfolio p = findById(id);
        p.setName(name);
        p.setDescription(description);
        if (currency != null) p.setCurrency(currency);
        return portfolioRepository.save(p);
    }

    @Transactional
    public void delete(UUID id) {
        portfolioRepository.deleteById(id);
    }
}
