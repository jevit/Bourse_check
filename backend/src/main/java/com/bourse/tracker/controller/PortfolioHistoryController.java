package com.bourse.tracker.controller;

import com.bourse.tracker.service.PortfolioHistoryService;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/portfolios/{portfolioId}/history")
@RequiredArgsConstructor
public class PortfolioHistoryController {

    private final PortfolioHistoryService portfolioHistoryService;

    @GetMapping
    public List<PortfolioHistoryService.ValuePoint> getHistory(
            @PathVariable UUID portfolioId,
            @RequestParam(defaultValue = "1M") String period,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate from,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate to) {
        LocalDate end = to != null ? to : LocalDate.now();
        LocalDate start = from != null ? from : switch (period) {
            case "1M" -> end.minusMonths(1);
            case "3M" -> end.minusMonths(3);
            case "6M" -> end.minusMonths(6);
            case "1Y" -> end.minusYears(1);
            default -> end.minusMonths(1);
        };
        return portfolioHistoryService.getHistory(portfolioId, start, end);
    }
}
