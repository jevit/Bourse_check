package com.bourse.tracker.service;

import com.bourse.tracker.domain.DividendEvent;
import com.bourse.tracker.repository.DividendEventRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.Month;
import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class DividendService {

    private final DividendEventRepository dividendEventRepository;
    private final InstrumentService instrumentService;

    public List<DividendEvent> findByPortfolio(UUID portfolioId) {
        return dividendEventRepository.findByPortfolioIdOrderByExDividendDateDesc(portfolioId);
    }

    @Transactional
    public DividendEvent create(UUID portfolioId, String ticker, String instrumentName,
                                 LocalDate exDividendDate, LocalDate paymentDate,
                                 BigDecimal amountPerShare, BigDecimal quantity,
                                 String currency, BigDecimal taxWithheld) {
        instrumentService.findOrCreate(ticker, instrumentName);
        BigDecimal grossAmount = amountPerShare.multiply(quantity != null ? quantity : BigDecimal.ONE);
        BigDecimal withheld = taxWithheld != null ? taxWithheld : BigDecimal.ZERO;
        BigDecimal netAmount = grossAmount.subtract(withheld);

        DividendEvent d = DividendEvent.builder()
                .portfolioId(portfolioId)
                .ticker(ticker.toUpperCase())
                .exDividendDate(exDividendDate)
                .paymentDate(paymentDate)
                .amountPerShare(amountPerShare)
                .quantity(quantity != null ? quantity : BigDecimal.ONE)
                .currency(currency != null ? currency : "EUR")
                .taxWithheld(withheld)
                .netAmount(netAmount)
                .build();
        return dividendEventRepository.save(d);
    }

    @Transactional
    public void delete(UUID portfolioId, UUID id) {
        DividendEvent d = dividendEventRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Dividend not found"));
        if (!d.getPortfolioId().equals(portfolioId)) {
            throw new IllegalArgumentException("Dividend does not belong to this portfolio");
        }
        dividendEventRepository.delete(d);
    }

    public MonthlySummary getMonthlySummary(UUID portfolioId) {
        LocalDate from = LocalDate.now().minusMonths(12).withDayOfMonth(1);
        List<DividendEvent> events = dividendEventRepository
                .findByPortfolioIdAndExDividendDateBetweenOrderByExDividendDate(
                        portfolioId, from, LocalDate.now());

        Map<String, BigDecimal> byMonth = new LinkedHashMap<>();
        for (DividendEvent e : events) {
            String key = e.getExDividendDate().getYear() + "-"
                    + String.format("%02d", e.getExDividendDate().getMonthValue());
            byMonth.merge(key, e.getNetAmount(), BigDecimal::add);
        }

        BigDecimal totalYear = events.stream()
                .filter(e -> e.getExDividendDate().getYear() == LocalDate.now().getYear())
                .map(DividendEvent::getNetAmount)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        BigDecimal rollingYear = events.stream()
                .map(DividendEvent::getNetAmount)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        return new MonthlySummary(byMonth, totalYear, rollingYear);
    }

    public record MonthlySummary(
            Map<String, BigDecimal> byMonth,
            BigDecimal totalCurrentYear,
            BigDecimal rollingTwelveMonths
    ) {}

    // US-304: projection dividendes sur N ans avec DGR
    public List<ProjectionYear> projectDividends(UUID portfolioId, int years, double dgr) {
        LocalDate from = LocalDate.now().minusYears(1);
        BigDecimal baseAnnual = dividendEventRepository
                .findByPortfolioIdAndExDividendDateBetweenOrderByExDividendDate(portfolioId, from, LocalDate.now())
                .stream()
                .map(DividendEvent::getNetAmount)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        List<ProjectionYear> projection = new ArrayList<>();
        BigDecimal current = baseAnnual;
        for (int y = 1; y <= years; y++) {
            current = current.multiply(BigDecimal.valueOf(1 + dgr / 100));
            projection.add(new ProjectionYear(LocalDate.now().getYear() + y, current));
        }
        return projection;
    }

    public record ProjectionYear(int year, BigDecimal projectedAnnualDividend) {}
}
