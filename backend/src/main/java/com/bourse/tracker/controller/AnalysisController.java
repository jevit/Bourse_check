package com.bourse.tracker.controller;

import com.bourse.tracker.service.InvestmentScoringService;
import com.bourse.tracker.service.OpportunityService;
import com.bourse.tracker.service.TechnicalAnalysisService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequiredArgsConstructor
public class AnalysisController {

    private final TechnicalAnalysisService technicalAnalysisService;
    private final InvestmentScoringService scoringService;
    private final OpportunityService opportunityService;

    // Analyse technique d'un instrument
    @GetMapping("/api/instruments/{ticker}/analysis/technical")
    public TechnicalAnalysisService.TechnicalSnapshot technical(@PathVariable String ticker) {
        return technicalAnalysisService.analyze(ticker.toUpperCase());
    }

    // Score d'investissement complet pour une position dans un portefeuille
    @GetMapping("/api/portfolios/{portfolioId}/positions/{ticker}/score")
    public InvestmentScoringService.InvestmentScore score(
            @PathVariable UUID portfolioId,
            @PathVariable String ticker) {
        return scoringService.score(portfolioId, ticker.toUpperCase());
    }

    // Toutes les opportunités classées par score (positions + watchlist)
    @GetMapping("/api/portfolios/{portfolioId}/opportunities")
    public List<OpportunityService.OpportunityItem> opportunities(@PathVariable UUID portfolioId) {
        return opportunityService.getOpportunities(portfolioId);
    }
}
