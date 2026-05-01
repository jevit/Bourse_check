package com.bourse.tracker.controller;

import com.bourse.tracker.domain.PriceAlert;
import com.bourse.tracker.dto.request.CreateAlertRequest;
import com.bourse.tracker.service.PriceAlertService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/alerts")
@RequiredArgsConstructor
public class PriceAlertController {

    private final PriceAlertService priceAlertService;

    @GetMapping
    public List<PriceAlert> list() {
        return priceAlertService.findAll();
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public PriceAlert create(@Valid @RequestBody CreateAlertRequest req) {
        return priceAlertService.create(req.ticker(), req.portfolioId(),
                req.direction(), req.targetPrice());
    }

    @PutMapping("/{id}/toggle")
    public PriceAlert toggle(@PathVariable UUID id) {
        return priceAlertService.toggle(id);
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void delete(@PathVariable UUID id) {
        priceAlertService.delete(id);
    }
}
