package com.bourse.tracker.controller;

import com.bourse.tracker.domain.Portfolio;
import com.bourse.tracker.dto.request.CreatePortfolioRequest;
import com.bourse.tracker.service.PortfolioService;
import com.bourse.tracker.service.PositionService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/portfolios")
@RequiredArgsConstructor
public class PortfolioController {

    private final PortfolioService portfolioService;
    private final PositionService positionService;

    @GetMapping
    public List<Portfolio> list() {
        return portfolioService.findAll();
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public Portfolio create(@Valid @RequestBody CreatePortfolioRequest req) {
        return portfolioService.create(req.name(), req.description(), req.currency());
    }

    @GetMapping("/{id}")
    public Portfolio get(@PathVariable UUID id) {
        return portfolioService.findById(id);
    }

    @PutMapping("/{id}")
    public Portfolio update(@PathVariable UUID id, @Valid @RequestBody CreatePortfolioRequest req) {
        return portfolioService.update(id, req.name(), req.description(), req.currency());
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void delete(@PathVariable UUID id) {
        portfolioService.delete(id);
    }

    @GetMapping("/{id}/dashboard")
    public ResponseEntity<PositionService.DashboardSummary> dashboard(@PathVariable UUID id) {
        portfolioService.findById(id); // ensure exists
        return ResponseEntity.ok(positionService.getDashboardSummary(id));
    }
}
