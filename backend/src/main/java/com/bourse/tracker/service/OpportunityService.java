package com.bourse.tracker.service;

import com.bourse.tracker.domain.WatchlistItem;
import com.bourse.tracker.repository.TransactionRepository;
import com.bourse.tracker.repository.WatchlistRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.util.*;
import java.util.stream.Collectors;

/**
 * Identifie les meilleures opportunités d'achat/renforcement dans un portefeuille.
 * Combine les positions existantes (DCA helper) et la watchlist.
 */
@Service
@RequiredArgsConstructor
public class OpportunityService {

    private final TransactionRepository transactionRepository;
    private final WatchlistRepository watchlistRepository;
    private final InvestmentScoringService scoringService;
    private final PositionService positionService;

    public record OpportunityItem(
            String ticker,
            String source,         // "POSITION" ou "WATCHLIST"
            InvestmentScoringService.InvestmentScore score,
            BigDecimal currentWeight,
            BigDecimal suggestedAllocationPct,
            boolean isAlertTriggered  // prix actuel < prix cible watchlist
    ) {}

    public List<OpportunityItem> getOpportunities(UUID portfolioId) {
        List<OpportunityItem> result = new ArrayList<>();

        // 1. Positions existantes — candidats au renforcement
        List<PositionService.PositionSnapshot> positions = positionService.getPositions(portfolioId);
        BigDecimal totalValue = positions.stream()
                .map(PositionService.PositionSnapshot::currentValue)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        for (PositionService.PositionSnapshot pos : positions) {
            try {
                InvestmentScoringService.InvestmentScore score = scoringService.score(portfolioId, pos.ticker());
                BigDecimal weight = totalValue.compareTo(BigDecimal.ZERO) != 0
                        ? pos.currentValue().divide(totalValue, 4, java.math.RoundingMode.HALF_UP)
                              .multiply(BigDecimal.valueOf(100))
                        : BigDecimal.ZERO;
                result.add(new OpportunityItem(pos.ticker(), "POSITION", score, weight, null, false));
            } catch (Exception ignored) {}
        }

        // 2. Watchlist — nouvelles positions potentielles
        List<WatchlistItem> watchlist = watchlistRepository.findByPortfolioIdAndActiveTrue(portfolioId);
        for (WatchlistItem item : watchlist) {
            try {
                InvestmentScoringService.InvestmentScore score = scoringService.score(portfolioId, item.getTicker());
                boolean triggered = item.getTargetPrice() != null
                        && score.technical().currentPrice().compareTo(item.getTargetPrice()) <= 0;
                result.add(new OpportunityItem(
                        item.getTicker(), "WATCHLIST", score,
                        BigDecimal.ZERO, item.getMaxWeightPct(), triggered));
            } catch (Exception ignored) {}
        }

        // Tri par score décroissant
        result.sort(Comparator.comparingInt(o -> -o.score().totalScore()));
        return result;
    }
}
