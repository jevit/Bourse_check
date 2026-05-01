package com.bourse.tracker.controller;

import com.bourse.tracker.domain.Instrument;
import com.bourse.tracker.dto.request.CreateInstrumentRequest;
import com.bourse.tracker.service.InstrumentService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/instruments")
@RequiredArgsConstructor
public class InstrumentController {

    private final InstrumentService instrumentService;

    @GetMapping
    public List<Instrument> list(@RequestParam(required = false) String q) {
        if (q != null && !q.isBlank()) return instrumentService.search(q);
        return instrumentService.findAll();
    }

    @GetMapping("/{ticker}")
    public Instrument get(@PathVariable String ticker) {
        return instrumentService.findById(ticker.toUpperCase());
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public Instrument createOrUpdate(@Valid @RequestBody CreateInstrumentRequest req) {
        return instrumentService.createOrUpdate(req.ticker(), req.name(), req.isin(),
                req.type(), req.currency(), req.exchange(), req.sector(), req.country());
    }
}
