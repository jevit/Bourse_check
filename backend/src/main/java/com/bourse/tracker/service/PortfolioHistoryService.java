package com.bourse.tracker.service;

import com.bourse.tracker.domain.Transaction;
import com.bourse.tracker.enums.TransactionType;
import com.bourse.tracker.quote.QuoteProvider;
import com.bourse.tracker.quote.QuoteService;
import com.bourse.tracker.repository.QuoteRepository;
import com.bourse.tracker.repository.TransactionRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.util.*;
import java.util.stream.Collectors;

/**
 * US-203: évolution de la valeur du portefeuille dans le temps.
 */
@Service
@RequiredArgsConstructor
public class PortfolioHistoryService {

    private final TransactionRepository transactionRepository;
    private final QuoteRepository quoteRepository;
    private final QuoteService quoteService;

    public record ValuePoint(LocalDate date, BigDecimal totalValue, BigDecimal invested) {}

    public List<ValuePoint> getHistory(UUID portfolioId, LocalDate from, LocalDate to) {
        List<Transaction> allTxs = transactionRepository.findByPortfolioIdOrderByDateDesc(portfolioId);
        List<String> tickers = allTxs.stream().map(Transaction::getTicker).distinct().toList();

        // Fetch historical quotes for all tickers
        tickers.forEach(t -> {
            try { quoteService.getHistory(t, from, to); } catch (Exception ignored) {}
        });

        List<ValuePoint> points = new ArrayList<>();
        LocalDate current = from;
        while (!current.isAfter(to)) {
            final LocalDate day = current;
            BigDecimal totalValue = BigDecimal.ZERO;
            BigDecimal invested = BigDecimal.ZERO;

            // Build holdings at this date
            Map<String, BigDecimal> holdings = new HashMap<>();
            for (Transaction t : allTxs) {
                if (t.getDate().isAfter(day)) continue;
                holdings.merge(t.getTicker(), switch (t.getType()) {
                    case BUY, TRANSFER_IN -> t.getQuantity();
                    case SELL, TRANSFER_OUT -> t.getQuantity().negate();
                    default -> BigDecimal.ZERO;
                }, BigDecimal::add);
                if (t.getType() == TransactionType.BUY) {
                    invested = invested.add(t.getQuantity().multiply(t.getUnitPrice()).add(t.getFees()));
                }
            }

            // Value at day
            for (Map.Entry<String, BigDecimal> entry : holdings.entrySet()) {
                if (entry.getValue().compareTo(BigDecimal.ZERO) <= 0) continue;
                var quote = quoteRepository.findByTickerAndDateBetweenOrderByDate(
                        entry.getKey(), day.minusDays(7), day);
                if (!quote.isEmpty()) {
                    BigDecimal price = quote.get(quote.size() - 1).getClosePrice();
                    totalValue = totalValue.add(entry.getValue().multiply(price));
                }
            }

            points.add(new ValuePoint(day, totalValue, invested));
            current = current.plusDays(1);
        }
        return points;
    }
}
