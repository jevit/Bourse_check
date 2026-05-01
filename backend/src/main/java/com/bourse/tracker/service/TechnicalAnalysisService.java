package com.bourse.tracker.service;

import com.bourse.tracker.domain.Quote;
import com.bourse.tracker.quote.QuoteService;
import com.bourse.tracker.repository.QuoteRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

/**
 * Indicateurs techniques classiques calculés sur l'historique de cours stocké.
 * Méthodes éprouvées : SMA, RSI, bandes 52 semaines.
 */
@Service
@RequiredArgsConstructor
public class TechnicalAnalysisService {

    private final QuoteRepository quoteRepository;
    private final QuoteService quoteService;

    public record TechnicalSnapshot(
            String ticker,
            BigDecimal currentPrice,
            BigDecimal sma50,
            BigDecimal sma200,
            BigDecimal rsi14,
            BigDecimal high52w,
            BigDecimal low52w,
            BigDecimal pctFrom52wLow,
            BigDecimal pctFrom52wHigh,
            BigDecimal pctFromSma200,
            boolean aboveSma50,
            boolean aboveSma200,
            boolean goldenCross,     // SMA50 > SMA200
            String rsiSignal,        // OVERSOLD / NEUTRAL / OVERBOUGHT
            LocalDate lastQuoteDate
    ) {}

    @Cacheable(value = "technicalAnalysis", key = "#ticker")
    public TechnicalSnapshot analyze(String ticker) {
        // Ensure we have enough history (fetch last 250 trading days ≈ 1 year)
        LocalDate to = LocalDate.now();
        LocalDate from = to.minusDays(365);
        quoteService.getHistory(ticker, from, to);

        List<Quote> quotes = quoteRepository
                .findByTickerAndDateBetweenOrderByDate(ticker, from, to);

        BigDecimal currentPrice = quoteService.getLatestPrice(ticker);
        if (quotes.isEmpty()) {
            return emptySnapshot(ticker, currentPrice);
        }

        List<BigDecimal> prices = quotes.stream().map(Quote::getClosePrice).toList();
        LocalDate lastDate = quotes.get(quotes.size() - 1).getDate();

        BigDecimal sma50 = sma(prices, 50);
        BigDecimal sma200 = sma(prices, 200);
        BigDecimal rsi = rsi(prices, 14);

        BigDecimal high52w = prices.stream().reduce(prices.get(0), BigDecimal::max);
        BigDecimal low52w = prices.stream().reduce(prices.get(0), BigDecimal::min);

        BigDecimal pctFrom52wLow = low52w.compareTo(BigDecimal.ZERO) != 0
                ? currentPrice.subtract(low52w).divide(low52w, 4, RoundingMode.HALF_UP).multiply(BigDecimal.valueOf(100))
                : BigDecimal.ZERO;
        BigDecimal pctFrom52wHigh = high52w.compareTo(BigDecimal.ZERO) != 0
                ? currentPrice.subtract(high52w).divide(high52w, 4, RoundingMode.HALF_UP).multiply(BigDecimal.valueOf(100))
                : BigDecimal.ZERO;
        BigDecimal pctFromSma200 = sma200 != null && sma200.compareTo(BigDecimal.ZERO) != 0
                ? currentPrice.subtract(sma200).divide(sma200, 4, RoundingMode.HALF_UP).multiply(BigDecimal.valueOf(100))
                : BigDecimal.ZERO;

        String rsiSignal = "NEUTRAL";
        if (rsi != null) {
            if (rsi.compareTo(new BigDecimal("30")) <= 0) rsiSignal = "OVERSOLD";
            else if (rsi.compareTo(new BigDecimal("70")) >= 0) rsiSignal = "OVERBOUGHT";
        }

        return new TechnicalSnapshot(
                ticker, currentPrice,
                sma50, sma200, rsi,
                high52w, low52w,
                pctFrom52wLow, pctFrom52wHigh, pctFromSma200,
                sma50 != null && currentPrice.compareTo(sma50) > 0,
                sma200 != null && currentPrice.compareTo(sma200) > 0,
                sma50 != null && sma200 != null && sma50.compareTo(sma200) > 0,
                rsiSignal, lastDate
        );
    }

    // Simple Moving Average sur les N derniers points
    private BigDecimal sma(List<BigDecimal> prices, int period) {
        if (prices.size() < period) return null;
        List<BigDecimal> window = prices.subList(prices.size() - period, prices.size());
        BigDecimal sum = window.stream().reduce(BigDecimal.ZERO, BigDecimal::add);
        return sum.divide(BigDecimal.valueOf(period), 4, RoundingMode.HALF_UP);
    }

    // RSI Wilder (méthode originale de J. Welles Wilder Jr., 1978)
    private BigDecimal rsi(List<BigDecimal> prices, int period) {
        if (prices.size() < period + 1) return null;

        List<BigDecimal> gains = new ArrayList<>();
        List<BigDecimal> losses = new ArrayList<>();

        for (int i = 1; i < prices.size(); i++) {
            BigDecimal change = prices.get(i).subtract(prices.get(i - 1));
            if (change.compareTo(BigDecimal.ZERO) >= 0) {
                gains.add(change);
                losses.add(BigDecimal.ZERO);
            } else {
                gains.add(BigDecimal.ZERO);
                losses.add(change.abs());
            }
        }

        // Initial average gain/loss (simple average for first period)
        BigDecimal avgGain = gains.subList(0, period).stream()
                .reduce(BigDecimal.ZERO, BigDecimal::add)
                .divide(BigDecimal.valueOf(period), 6, RoundingMode.HALF_UP);
        BigDecimal avgLoss = losses.subList(0, period).stream()
                .reduce(BigDecimal.ZERO, BigDecimal::add)
                .divide(BigDecimal.valueOf(period), 6, RoundingMode.HALF_UP);

        // Wilder smoothing for remaining periods
        for (int i = period; i < gains.size(); i++) {
            avgGain = avgGain.multiply(BigDecimal.valueOf(period - 1))
                    .add(gains.get(i))
                    .divide(BigDecimal.valueOf(period), 6, RoundingMode.HALF_UP);
            avgLoss = avgLoss.multiply(BigDecimal.valueOf(period - 1))
                    .add(losses.get(i))
                    .divide(BigDecimal.valueOf(period), 6, RoundingMode.HALF_UP);
        }

        if (avgLoss.compareTo(BigDecimal.ZERO) == 0) return new BigDecimal("100");
        BigDecimal rs = avgGain.divide(avgLoss, 6, RoundingMode.HALF_UP);
        BigDecimal rsi = BigDecimal.valueOf(100)
                .subtract(BigDecimal.valueOf(100).divide(BigDecimal.ONE.add(rs), 2, RoundingMode.HALF_UP));
        return rsi;
    }

    private TechnicalSnapshot emptySnapshot(String ticker, BigDecimal price) {
        return new TechnicalSnapshot(ticker, price, null, null, null,
                price, price, BigDecimal.ZERO, BigDecimal.ZERO, BigDecimal.ZERO,
                false, false, false, "NEUTRAL", LocalDate.now());
    }
}
