package com.bourse.tracker.service;

import com.bourse.tracker.domain.DividendEvent;
import com.bourse.tracker.domain.Transaction;
import com.bourse.tracker.enums.TransactionType;
import com.bourse.tracker.quote.QuoteService;
import com.bourse.tracker.repository.DividendEventRepository;
import com.bourse.tracker.repository.TransactionRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class PositionService {

    private final TransactionRepository transactionRepository;
    private final DividendEventRepository dividendEventRepository;
    private final QuoteService quoteService;

    public record PositionSnapshot(
            String ticker,
            BigDecimal quantity,
            BigDecimal pru,
            BigDecimal currentPrice,
            BigDecimal currentValue,
            BigDecimal latentPnl,
            BigDecimal latentPnlPct,
            BigDecimal annualDividend,
            BigDecimal yoc,
            String enveloppe,
            LocalDate lastUpdated
    ) {}

    public List<PositionSnapshot> getPositions(UUID portfolioId) {
        List<String> tickers = transactionRepository.findDistinctTickersByPortfolioId(portfolioId);
        List<PositionSnapshot> positions = new ArrayList<>();
        for (String ticker : tickers) {
            PositionSnapshot pos = buildPosition(portfolioId, ticker);
            if (pos.quantity().compareTo(BigDecimal.ZERO) > 0) {
                positions.add(pos);
            }
        }
        return positions;
    }

    public PositionSnapshot getPosition(UUID portfolioId, String ticker) {
        return buildPosition(portfolioId, ticker);
    }

    private PositionSnapshot buildPosition(UUID portfolioId, String ticker) {
        List<Transaction> txs = transactionRepository
                .findByPortfolioIdAndTickerOrderByDate(portfolioId, ticker);

        BigDecimal totalQty = BigDecimal.ZERO;
        BigDecimal totalCost = BigDecimal.ZERO;
        BigDecimal buyQty = BigDecimal.ZERO;
        String enveloppe = "";

        for (Transaction t : txs) {
            switch (t.getType()) {
                case BUY -> {
                    BigDecimal cost = t.getQuantity().multiply(t.getUnitPrice()).add(t.getFees());
                    totalCost = totalCost.add(cost);
                    buyQty = buyQty.add(t.getQuantity());
                    totalQty = totalQty.add(t.getQuantity());
                    enveloppe = t.getEnveloppe().name();
                }
                case SELL -> totalQty = totalQty.subtract(t.getQuantity());
                case TRANSFER_IN -> totalQty = totalQty.add(t.getQuantity());
                case TRANSFER_OUT -> totalQty = totalQty.subtract(t.getQuantity());
                default -> {}
            }
        }

        // PRU = Σ(qty * price + fees) / Σ qty  [BUY only]
        BigDecimal pru = buyQty.compareTo(BigDecimal.ZERO) > 0
                ? totalCost.divide(buyQty, 6, RoundingMode.HALF_UP)
                : BigDecimal.ZERO;

        BigDecimal currentPrice = quoteService.getLatestPrice(ticker);
        BigDecimal currentValue = totalQty.multiply(currentPrice);
        BigDecimal costBasis = pru.multiply(totalQty);
        BigDecimal latentPnl = currentValue.subtract(costBasis);
        BigDecimal latentPnlPct = costBasis.compareTo(BigDecimal.ZERO) != 0
                ? latentPnl.divide(costBasis, 6, RoundingMode.HALF_UP).multiply(BigDecimal.valueOf(100))
                : BigDecimal.ZERO;

        // YoC = dividende annuel net / (PRU * qty) * 100
        BigDecimal annualDividend = getAnnualDividend(portfolioId, ticker);
        BigDecimal yoc = costBasis.compareTo(BigDecimal.ZERO) != 0
                ? annualDividend.divide(costBasis, 6, RoundingMode.HALF_UP).multiply(BigDecimal.valueOf(100))
                : BigDecimal.ZERO;

        return new PositionSnapshot(
                ticker, totalQty, pru, currentPrice, currentValue,
                latentPnl, latentPnlPct, annualDividend, yoc,
                enveloppe, LocalDate.now()
        );
    }

    private BigDecimal getAnnualDividend(UUID portfolioId, String ticker) {
        LocalDate oneYearAgo = LocalDate.now().minusYears(1);
        return dividendEventRepository
                .findByPortfolioIdAndTicker(portfolioId, ticker)
                .stream()
                .filter(d -> d.getExDividendDate().isAfter(oneYearAgo))
                .map(DividendEvent::getNetAmount)
                .reduce(BigDecimal.ZERO, BigDecimal::add);
    }

    public DashboardSummary getDashboardSummary(UUID portfolioId) {
        List<PositionSnapshot> positions = getPositions(portfolioId);
        BigDecimal totalValue = positions.stream()
                .map(PositionSnapshot::currentValue)
                .reduce(BigDecimal.ZERO, BigDecimal::add);
        BigDecimal totalCost = positions.stream()
                .map(p -> p.pru().multiply(p.quantity()))
                .reduce(BigDecimal.ZERO, BigDecimal::add);
        BigDecimal totalPnl = totalValue.subtract(totalCost);
        BigDecimal totalPnlPct = totalCost.compareTo(BigDecimal.ZERO) != 0
                ? totalPnl.divide(totalCost, 6, RoundingMode.HALF_UP).multiply(BigDecimal.valueOf(100))
                : BigDecimal.ZERO;
        BigDecimal annualDividends = positions.stream()
                .map(PositionSnapshot::annualDividend)
                .reduce(BigDecimal.ZERO, BigDecimal::add);
        return new DashboardSummary(totalValue, totalCost, totalPnl, totalPnlPct, annualDividends, positions);
    }

    public record DashboardSummary(
            BigDecimal totalValue,
            BigDecimal totalCost,
            BigDecimal totalPnl,
            BigDecimal totalPnlPct,
            BigDecimal annualDividends,
            List<PositionSnapshot> positions
    ) {}
}
