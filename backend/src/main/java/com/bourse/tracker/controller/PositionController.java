package com.bourse.tracker.controller;

import com.bourse.tracker.service.PositionService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/portfolios/{portfolioId}/positions")
@RequiredArgsConstructor
public class PositionController {

    private final PositionService positionService;

    @GetMapping
    public List<PositionService.PositionSnapshot> list(@PathVariable UUID portfolioId) {
        return positionService.getPositions(portfolioId);
    }

    @GetMapping("/{ticker}")
    public PositionService.PositionSnapshot get(@PathVariable UUID portfolioId,
                                                  @PathVariable String ticker) {
        return positionService.getPosition(portfolioId, ticker.toUpperCase());
    }
}
