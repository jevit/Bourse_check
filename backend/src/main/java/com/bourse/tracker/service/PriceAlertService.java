package com.bourse.tracker.service;

import com.bourse.tracker.domain.PriceAlert;
import com.bourse.tracker.enums.AlertDirection;
import com.bourse.tracker.quote.QuoteService;
import com.bourse.tracker.repository.PriceAlertRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.OffsetDateTime;
import java.util.List;
import java.util.UUID;

@Service
@Slf4j
@RequiredArgsConstructor
public class PriceAlertService {

    private final PriceAlertRepository priceAlertRepository;
    private final QuoteService quoteService;

    public List<PriceAlert> findAll() {
        return priceAlertRepository.findAll();
    }

    public List<PriceAlert> findByPortfolio(UUID portfolioId) {
        return priceAlertRepository.findByPortfolioIdOrderByCreatedAtDesc(portfolioId);
    }

    @Transactional
    public PriceAlert create(String ticker, UUID portfolioId, AlertDirection direction, BigDecimal targetPrice) {
        PriceAlert alert = PriceAlert.builder()
                .ticker(ticker.toUpperCase())
                .portfolioId(portfolioId)
                .direction(direction)
                .targetPrice(targetPrice)
                .active(true)
                .build();
        return priceAlertRepository.save(alert);
    }

    @Transactional
    public PriceAlert toggle(UUID id) {
        PriceAlert alert = priceAlertRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Alert not found: " + id));
        alert.setActive(!alert.isActive());
        return priceAlertRepository.save(alert);
    }

    @Transactional
    public void delete(UUID id) {
        priceAlertRepository.deleteById(id);
    }

    // US-501: vérification des alertes toutes les 15 minutes
    @Scheduled(fixedDelay = 900_000)
    @Transactional
    public void checkAlerts() {
        List<PriceAlert> active = priceAlertRepository.findByActiveTrue();
        for (PriceAlert alert : active) {
            try {
                BigDecimal price = quoteService.getLatestPrice(alert.getTicker());
                boolean triggered = switch (alert.getDirection()) {
                    case ABOVE -> price.compareTo(alert.getTargetPrice()) >= 0;
                    case BELOW -> price.compareTo(alert.getTargetPrice()) <= 0;
                };
                if (triggered) {
                    log.info("Alert triggered: {} {} {} (current: {})",
                            alert.getTicker(), alert.getDirection(), alert.getTargetPrice(), price);
                    alert.setActive(false);
                    alert.setTriggeredAt(OffsetDateTime.now());
                    priceAlertRepository.save(alert);
                }
            } catch (Exception e) {
                log.warn("Error checking alert {}: {}", alert.getId(), e.getMessage());
            }
        }
    }
}
