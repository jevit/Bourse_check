package com.bourse.tracker.controller;

import com.bourse.tracker.domain.Quote;
import com.bourse.tracker.quote.QuoteService;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/quotes")
@RequiredArgsConstructor
public class QuoteController {

    private final QuoteService quoteService;

    @GetMapping("/{ticker}/latest")
    public Map<String, Object> latest(@PathVariable String ticker) {
        BigDecimal price = quoteService.getLatestPrice(ticker.toUpperCase());
        return Map.of("ticker", ticker.toUpperCase(), "price", price, "date", LocalDate.now());
    }

    @GetMapping("/{ticker}/history")
    public List<Quote> history(
            @PathVariable String ticker,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate from,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate to) {
        return quoteService.getHistory(ticker.toUpperCase(), from, to);
    }

    @PostMapping("/{ticker}/refresh")
    public Map<String, Object> refresh(@PathVariable String ticker) {
        quoteService.refreshQuote(ticker.toUpperCase());
        return Map.of("refreshed", ticker.toUpperCase(), "timestamp", LocalDate.now());
    }
}
