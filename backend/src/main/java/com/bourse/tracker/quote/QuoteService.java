package com.bourse.tracker.quote;

import com.bourse.tracker.domain.Quote;
import com.bourse.tracker.repository.QuoteRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class QuoteService {

    private final QuoteRepository quoteRepository;
    private final QuoteProvider quoteProvider;

    public BigDecimal getLatestPrice(String ticker) {
        Optional<Quote> cached = quoteRepository.findLatestByTicker(ticker);
        if (cached.isPresent() && cached.get().getDate().equals(LocalDate.now())) {
            return cached.get().getClosePrice();
        }
        QuoteProvider.QuoteData data = quoteProvider.getLatestQuote(ticker);
        if (data.price().compareTo(BigDecimal.ZERO) > 0) {
            saveQuote(data);
        }
        return data.price();
    }

    @Transactional
    public void refreshQuote(String ticker) {
        QuoteProvider.QuoteData data = quoteProvider.getLatestQuote(ticker);
        if (data.price().compareTo(BigDecimal.ZERO) > 0) {
            saveQuote(data);
        }
    }

    @Transactional
    public List<Quote> getHistory(String ticker, LocalDate from, LocalDate to) {
        List<Quote> existing = quoteRepository.findByTickerAndDateBetweenOrderByDate(ticker, from, to);
        if (!existing.isEmpty()) return existing;
        List<QuoteProvider.QuoteData> fetched = quoteProvider.getHistoricalQuotes(ticker, from, to);
        fetched.forEach(this::saveQuote);
        return quoteRepository.findByTickerAndDateBetweenOrderByDate(ticker, from, to);
    }

    private void saveQuote(QuoteProvider.QuoteData data) {
        Quote quote = Quote.builder()
                .ticker(data.ticker())
                .date(data.date())
                .closePrice(data.price())
                .currency(data.currency())
                .source("YAHOO")
                .build();
        quoteRepository.save(quote);
    }
}
