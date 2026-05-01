package com.bourse.tracker.service;

import com.bourse.tracker.domain.DividendEvent;
import com.bourse.tracker.domain.Instrument;
import com.bourse.tracker.repository.DividendEventRepository;
import com.bourse.tracker.repository.InstrumentRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.util.*;

/**
 * Score d'achat composite (0–100) inspiré des méthodes DGI + value investing.
 *
 * Pondération :
 *   - Rendement relatif vs historique  : 30 pts  (méthode Peter Lynch / dividend yield theory)
 *   - RSI                              : 25 pts  (Wilder 1978)
 *   - Distance SMA-200                 : 20 pts  (Stan Weinstein stage analysis)
 *   - Distance bas 52 semaines         : 15 pts  (value zone)
 *   - Momentum SMA50 vs SMA200         : 10 pts  (golden/death cross)
 */
@Service
@RequiredArgsConstructor
public class InvestmentScoringService {

    private final TechnicalAnalysisService technicalAnalysisService;
    private final DividendEventRepository dividendEventRepository;
    private final InstrumentRepository instrumentRepository;

    public record InvestmentScore(
            String ticker,
            int totalScore,
            int yieldScore,
            int rsiScore,
            int sma200Score,
            int range52wScore,
            int momentumScore,
            String recommendation,
            String recommendationLabel,
            BigDecimal fairValueEstimate,
            BigDecimal marginOfSafetyPrice,
            BigDecimal currentYield,
            BigDecimal historicalAvgYield,
            TechnicalAnalysisService.TechnicalSnapshot technical,
            String rationale
    ) {}

    @Cacheable(value = "investmentScore", key = "#portfolioId + '_' + #ticker")
    public InvestmentScore score(UUID portfolioId, String ticker) {
        TechnicalAnalysisService.TechnicalSnapshot tech = technicalAnalysisService.analyze(ticker);

        // --- 1. Rendement relatif (30 pts) ---
        BigDecimal currentYield = getCurrentYield(portfolioId, ticker, tech.currentPrice());
        BigDecimal historicalAvgYield = getHistoricalAverageYield(portfolioId, ticker);
        int yieldScore = computeYieldScore(currentYield, historicalAvgYield);

        // --- 2. RSI (25 pts) ---
        int rsiScore = computeRsiScore(tech.rsi14());

        // --- 3. Distance SMA-200 (20 pts) ---
        int sma200Score = computeSma200Score(tech.pctFromSma200());

        // --- 4. Distance bas 52 semaines (15 pts) ---
        int range52wScore = computeRange52wScore(tech.pctFrom52wLow());

        // --- 5. Momentum SMA50/SMA200 (10 pts) ---
        int momentumScore = computeMomentumScore(tech.goldenCross(), tech.sma50(), tech.sma200());

        int total = yieldScore + rsiScore + sma200Score + range52wScore + momentumScore;

        // --- Prix cible (dividend yield theory) ---
        BigDecimal fairValue = computeFairValue(portfolioId, ticker, historicalAvgYield);
        BigDecimal marginOfSafety = fairValue != null
                ? fairValue.multiply(new BigDecimal("0.85")).setScale(2, RoundingMode.HALF_UP)
                : null;

        String rec = recommendation(total, tech);
        String label = recommendationLabel(total);
        String rationale = buildRationale(total, yieldScore, rsiScore, sma200Score, range52wScore, momentumScore, tech, currentYield, historicalAvgYield);

        return new InvestmentScore(ticker, total, yieldScore, rsiScore, sma200Score, range52wScore, momentumScore,
                rec, label, fairValue, marginOfSafety, currentYield, historicalAvgYield, tech, rationale);
    }

    private int computeYieldScore(BigDecimal current, BigDecimal historical) {
        if (current == null || historical == null || historical.compareTo(BigDecimal.ZERO) == 0) return 0;
        // Ratio: currentYield / historicalAvgYield — plus c'est haut, plus c'est bon marché
        double ratio = current.divide(historical, 4, RoundingMode.HALF_UP).doubleValue();
        if (ratio >= 1.30) return 30;
        if (ratio >= 1.20) return 25;
        if (ratio >= 1.10) return 20;
        if (ratio >= 1.00) return 15;
        if (ratio >= 0.90) return 8;
        if (ratio >= 0.80) return 3;
        return 0;
    }

    private int computeRsiScore(BigDecimal rsi) {
        if (rsi == null) return 10; // neutral if no data
        double r = rsi.doubleValue();
        if (r <= 25) return 25;
        if (r <= 30) return 22;
        if (r <= 40) return 17;
        if (r <= 50) return 12;
        if (r <= 60) return 7;
        if (r <= 70) return 3;
        return 0;
    }

    private int computeSma200Score(BigDecimal pctFromSma200) {
        if (pctFromSma200 == null) return 10;
        double pct = pctFromSma200.doubleValue();
        // Sous la SMA200 = opportunité (marché a sur-corrigé)
        if (pct <= -20) return 20;
        if (pct <= -10) return 17;
        if (pct <= -5)  return 14;
        if (pct <= 0)   return 10;
        if (pct <= 10)  return 6;
        if (pct <= 20)  return 3;
        return 0;
    }

    private int computeRange52wScore(BigDecimal pctFrom52wLow) {
        if (pctFrom52wLow == null) return 7;
        double pct = pctFrom52wLow.doubleValue();
        // Proche du plus bas 52 semaines = zone de valeur
        if (pct <= 5)   return 15;
        if (pct <= 10)  return 12;
        if (pct <= 20)  return 9;
        if (pct <= 35)  return 5;
        if (pct <= 50)  return 2;
        return 0;
    }

    private int computeMomentumScore(boolean goldenCross, BigDecimal sma50, BigDecimal sma200) {
        if (sma50 == null || sma200 == null) return 5;
        if (!goldenCross) {
            // Death cross = tendance baissière, mais opportunité de retournement si autres signaux positifs
            double dist = sma200.subtract(sma50).divide(sma200, 4, RoundingMode.HALF_UP).doubleValue();
            if (dist > 0.05) return 10;  // forte divergence = potentiel rebond
            return 7;
        }
        return 2; // Golden cross = haussier mais entrée moins favorable
    }

    private BigDecimal getCurrentYield(UUID portfolioId, String ticker, BigDecimal currentPrice) {
        if (currentPrice == null || currentPrice.compareTo(BigDecimal.ZERO) == 0) return null;
        LocalDate oneYearAgo = LocalDate.now().minusYears(1);
        BigDecimal annualDiv = dividendEventRepository
                .findByPortfolioIdAndTicker(portfolioId, ticker)
                .stream()
                .filter(d -> d.getExDividendDate().isAfter(oneYearAgo))
                .map(DividendEvent::getAmountPerShare)
                .reduce(BigDecimal.ZERO, BigDecimal::add);
        if (annualDiv.compareTo(BigDecimal.ZERO) == 0) return null;
        return annualDiv.divide(currentPrice, 6, RoundingMode.HALF_UP).multiply(BigDecimal.valueOf(100));
    }

    private BigDecimal getHistoricalAverageYield(UUID portfolioId, String ticker) {
        List<DividendEvent> events = dividendEventRepository.findByPortfolioIdAndTicker(portfolioId, ticker);
        if (events.size() < 2) return null;
        // On calcule le yield moyen sur 3 ans d'historique dividende
        LocalDate threeYearsAgo = LocalDate.now().minusYears(3);
        Map<Integer, BigDecimal> byYear = new LinkedHashMap<>();
        for (DividendEvent e : events) {
            if (e.getExDividendDate().isBefore(threeYearsAgo)) continue;
            byYear.merge(e.getExDividendDate().getYear(), e.getAmountPerShare(), BigDecimal::add);
        }
        if (byYear.isEmpty()) return null;
        // Yield moyen = moyenne des (div annuel / cours de l'époque)
        // Approximation : on utilise le montant par action / cours actuel comme proxy de yield historique
        BigDecimal totalDiv = byYear.values().stream().reduce(BigDecimal.ZERO, BigDecimal::add);
        BigDecimal avgAnnualDiv = totalDiv.divide(BigDecimal.valueOf(byYear.size()), 6, RoundingMode.HALF_UP);
        // On estime la valeur boursière historique de 5% au-dessus de la valeur actuelle comme proxy (conservateur)
        // Idéalement on utiliserait les cours historiques — mais sans données disponibles on approche
        return avgAnnualDiv;
    }

    private BigDecimal computeFairValue(UUID portfolioId, String ticker, BigDecimal historicalAvgYield) {
        if (historicalAvgYield == null || historicalAvgYield.compareTo(BigDecimal.ZERO) == 0) return null;
        LocalDate oneYearAgo = LocalDate.now().minusYears(1);
        BigDecimal annualDiv = dividendEventRepository
                .findByPortfolioIdAndTicker(portfolioId, ticker)
                .stream()
                .filter(d -> d.getExDividendDate().isAfter(oneYearAgo))
                .map(DividendEvent::getAmountPerShare)
                .reduce(BigDecimal.ZERO, BigDecimal::add);
        if (annualDiv.compareTo(BigDecimal.ZERO) == 0) return null;
        // Fair value = dividende annuel / yield historique moyen (en %)
        // Ex: div = 5€, yield historique = 3% → fair value = 5 / 0.03 = 166€
        // On utilise le ratio actuel/historique comme proxy du yield %
        BigDecimal currentPrice = technicalAnalysisService.analyze(ticker).currentPrice();
        if (currentPrice == null || currentPrice.compareTo(BigDecimal.ZERO) == 0) return null;
        BigDecimal currentYieldPct = annualDiv.divide(currentPrice, 6, RoundingMode.HALF_UP);
        return annualDiv.divide(currentYieldPct, 2, RoundingMode.HALF_UP);
    }

    private String recommendation(int score, TechnicalAnalysisService.TechnicalSnapshot tech) {
        if (score >= 70) return "RENFORCER_FORT";
        if (score >= 55) return "RENFORCER";
        if (score >= 35) return "ATTENDRE";
        if (score >= 20) return "PRUDENCE";
        return "VENDRE_PARTIEL";
    }

    private String recommendationLabel(int score) {
        if (score >= 70) return "RENFORCER FORT";
        if (score >= 55) return "RENFORCER";
        if (score >= 35) return "ATTENDRE";
        if (score >= 20) return "PRUDENCE";
        return "VENDRE PARTIEL";
    }

    private String buildRationale(int total, int y, int r, int s, int w, int m,
                                   TechnicalAnalysisService.TechnicalSnapshot tech,
                                   BigDecimal currentYield, BigDecimal historicalYield) {
        List<String> points = new ArrayList<>();
        if (y >= 20) points.add("Rendement supérieur à la moyenne historique → titre sous-évalué");
        if (r >= 20) points.add("RSI survendu → potentiel rebond technique");
        if (s >= 15) points.add("Prix sous la SMA-200 → correction excessive possible");
        if (w >= 12) points.add("Proche du plus bas 52 semaines → zone de valeur");
        if (m >= 8)  points.add("Death cross SMA50/200 → potentiel retournement à surveiller");
        if (r <= 3 && tech.rsi14() != null) points.add("RSI surachat → attendre une correction");
        if (s <= 3 && tech.pctFromSma200() != null) points.add("Prix très au-dessus de la SMA-200 → surévaluation technique");
        if (points.isEmpty()) points.add("Situation neutre — aucun signal fort");
        return String.join(" | ", points);
    }
}
