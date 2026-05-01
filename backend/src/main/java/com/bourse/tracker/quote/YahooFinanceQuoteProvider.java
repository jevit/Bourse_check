package com.bourse.tracker.quote;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.math.BigDecimal;
import java.time.Instant;
import java.time.LocalDate;
import java.time.ZoneOffset;
import java.util.ArrayList;
import java.util.List;

@Service
@Slf4j
@RequiredArgsConstructor
public class YahooFinanceQuoteProvider implements QuoteProvider {

    private static final String BASE_URL = "https://query1.finance.yahoo.com/v8/finance/chart/";
    private final RestTemplate restTemplate;
    private final ObjectMapper objectMapper;

    @Override
    @Cacheable(value = "quotes", key = "#ticker + '_latest'")
    public QuoteData getLatestQuote(String ticker) {
        String url = BASE_URL + ticker + "?interval=1d&range=5d";
        try {
            String json = restTemplate.getForObject(url, String.class);
            JsonNode root = objectMapper.readTree(json);
            JsonNode result = root.path("chart").path("result").get(0);
            JsonNode meta = result.path("meta");
            BigDecimal price = BigDecimal.valueOf(meta.path("regularMarketPrice").asDouble());
            String currency = meta.path("currency").asText("EUR");
            return new QuoteData(ticker, LocalDate.now(), price, currency);
        } catch (Exception e) {
            log.warn("Yahoo Finance unavailable for {}: {}", ticker, e.getMessage());
            return new QuoteData(ticker, LocalDate.now(), BigDecimal.ZERO, "EUR");
        }
    }

    @Override
    @Cacheable(value = "historicalQuotes", key = "#ticker + '_' + #from + '_' + #to")
    public List<QuoteData> getHistoricalQuotes(String ticker, LocalDate from, LocalDate to) {
        long period1 = from.atStartOfDay().toEpochSecond(ZoneOffset.UTC);
        long period2 = to.plusDays(1).atStartOfDay().toEpochSecond(ZoneOffset.UTC);
        String url = BASE_URL + ticker + "?interval=1d&period1=" + period1 + "&period2=" + period2;
        List<QuoteData> quotes = new ArrayList<>();
        try {
            String json = restTemplate.getForObject(url, String.class);
            JsonNode root = objectMapper.readTree(json);
            JsonNode result = root.path("chart").path("result").get(0);
            JsonNode timestamps = result.path("timestamp");
            JsonNode closes = result.path("indicators").path("quote").get(0).path("close");
            String currency = result.path("meta").path("currency").asText("EUR");
            for (int i = 0; i < timestamps.size(); i++) {
                long ts = timestamps.get(i).asLong();
                LocalDate date = Instant.ofEpochSecond(ts).atZone(ZoneOffset.UTC).toLocalDate();
                JsonNode closeNode = closes.get(i);
                if (!closeNode.isNull()) {
                    quotes.add(new QuoteData(ticker, date, BigDecimal.valueOf(closeNode.asDouble()), currency));
                }
            }
        } catch (Exception e) {
            log.warn("Yahoo Finance history unavailable for {}: {}", ticker, e.getMessage());
        }
        return quotes;
    }
}
