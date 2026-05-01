package com.bourse.tracker.service;

import com.bourse.tracker.domain.Instrument;
import com.bourse.tracker.repository.InstrumentRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class InstrumentService {

    private final InstrumentRepository instrumentRepository;

    public Instrument findOrCreate(String ticker, String name) {
        return instrumentRepository.findById(ticker)
                .orElseGet(() -> {
                    Instrument i = Instrument.builder()
                            .ticker(ticker.toUpperCase())
                            .name(name != null ? name : ticker)
                            .type("STOCK")
                            .currency("EUR")
                            .build();
                    return instrumentRepository.save(i);
                });
    }

    public Instrument findById(String ticker) {
        return instrumentRepository.findById(ticker)
                .orElseThrow(() -> new IllegalArgumentException("Instrument not found: " + ticker));
    }

    @Transactional
    public Instrument createOrUpdate(String ticker, String name, String isin, String type,
                                     String currency, String exchange, String sector, String country) {
        Instrument i = instrumentRepository.findById(ticker)
                .orElse(Instrument.builder().ticker(ticker.toUpperCase()).build());
        if (name != null) i.setName(name);
        if (isin != null) i.setIsin(isin);
        if (type != null) i.setType(type);
        if (currency != null) i.setCurrency(currency);
        if (exchange != null) i.setExchange(exchange);
        if (sector != null) i.setSector(sector);
        if (country != null) i.setCountry(country);
        return instrumentRepository.save(i);
    }

    public List<Instrument> search(String q) {
        return instrumentRepository.search(q);
    }

    public List<Instrument> findAll() {
        return instrumentRepository.findAll();
    }
}
