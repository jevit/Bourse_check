package com.bourse.tracker.controller;

import com.bourse.tracker.domain.DividendEvent;
import com.bourse.tracker.dto.request.CreateDividendRequest;
import com.bourse.tracker.service.DividendService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/portfolios/{portfolioId}/dividends")
@RequiredArgsConstructor
public class DividendController {

    private final DividendService dividendService;

    @GetMapping
    public List<DividendEvent> list(@PathVariable UUID portfolioId) {
        return dividendService.findByPortfolio(portfolioId);
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public DividendEvent create(@PathVariable UUID portfolioId,
                                 @Valid @RequestBody CreateDividendRequest req) {
        return dividendService.create(portfolioId, req.ticker(), req.instrumentName(),
                req.exDividendDate(), req.paymentDate(), req.amountPerShare(),
                req.quantity(), req.currency(), req.taxWithheld());
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void delete(@PathVariable UUID portfolioId, @PathVariable UUID id) {
        dividendService.delete(portfolioId, id);
    }

    @GetMapping("/summary")
    public DividendService.MonthlySummary summary(@PathVariable UUID portfolioId) {
        return dividendService.getMonthlySummary(portfolioId);
    }

    // US-304: projection dividendes
    @GetMapping("/projection")
    public List<DividendService.ProjectionYear> projection(
            @PathVariable UUID portfolioId,
            @RequestParam(defaultValue = "10") int years,
            @RequestParam(defaultValue = "5.0") double dgr) {
        return dividendService.projectDividends(portfolioId, years, dgr);
    }
}
