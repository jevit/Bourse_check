package com.bourse.tracker.controller;

import com.bourse.tracker.dto.request.TaxSimulationRequest;
import com.bourse.tracker.service.TaxService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/portfolios/{portfolioId}/tax")
@RequiredArgsConstructor
public class TaxController {

    private final TaxService taxService;

    /**
     * US-401: Simulation fiscale d'une vente.
     * DISCLAIMER: estimation non contractuelle.
     */
    @PostMapping("/simulate")
    public Map<String, Object> simulate(@PathVariable UUID portfolioId,
                                         @Valid @RequestBody TaxSimulationRequest req) {
        TaxService.TaxSimulation result = taxService.simulate(portfolioId, req.ticker(),
                req.sellQuantity(), req.sellPrice(), req.enveloppe(), req.openDate());
        return Map.of(
                "simulation", result,
                "disclaimer", "Estimation non contractuelle. Ne se substitue pas à un conseil fiscal professionnel."
        );
    }
}
