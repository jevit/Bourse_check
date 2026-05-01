package com.bourse.tracker.quote;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

public interface QuoteProvider {
    QuoteData getLatestQuote(String ticker);
    List<QuoteData> getHistoricalQuotes(String ticker, LocalDate from, LocalDate to);

    record QuoteData(String ticker, LocalDate date, BigDecimal price, String currency) {}
}
