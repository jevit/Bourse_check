package com.bourse.tracker.service;

import com.bourse.tracker.domain.Transaction;
import com.bourse.tracker.enums.EnveloppeType;
import com.bourse.tracker.enums.TransactionType;
import com.bourse.tracker.repository.TransactionRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class TransactionService {

    private final TransactionRepository transactionRepository;
    private final InstrumentService instrumentService;

    public List<Transaction> findByPortfolio(UUID portfolioId) {
        return transactionRepository.findByPortfolioIdOrderByDateDesc(portfolioId);
    }

    public List<Transaction> findByPortfolioAndTicker(UUID portfolioId, String ticker) {
        return transactionRepository.findByPortfolioIdAndTickerOrderByDate(portfolioId, ticker);
    }

    @Transactional
    public Transaction create(UUID portfolioId, String ticker, String instrumentName,
                               EnveloppeType enveloppe, TransactionType type, LocalDate date,
                               BigDecimal quantity, BigDecimal unitPrice, BigDecimal fees,
                               String currency, String notes) {
        instrumentService.findOrCreate(ticker, instrumentName);

        if (type == TransactionType.SELL) {
            validateSellQuantity(portfolioId, ticker, quantity, date);
        }

        Transaction t = Transaction.builder()
                .portfolioId(portfolioId)
                .ticker(ticker.toUpperCase())
                .enveloppe(enveloppe)
                .type(type)
                .date(date)
                .quantity(quantity)
                .unitPrice(unitPrice)
                .fees(fees != null ? fees : BigDecimal.ZERO)
                .currency(currency != null ? currency : "EUR")
                .notes(notes)
                .build();
        return transactionRepository.save(t);
    }

    @Transactional
    public Transaction update(UUID portfolioId, UUID transactionId, EnveloppeType enveloppe,
                               TransactionType type, LocalDate date, BigDecimal quantity,
                               BigDecimal unitPrice, BigDecimal fees, String currency, String notes) {
        Transaction t = transactionRepository.findById(transactionId)
                .orElseThrow(() -> new IllegalArgumentException("Transaction not found: " + transactionId));
        if (!t.getPortfolioId().equals(portfolioId)) {
            throw new IllegalArgumentException("Transaction does not belong to this portfolio");
        }
        t.setEnveloppe(enveloppe);
        t.setType(type);
        t.setDate(date);
        t.setQuantity(quantity);
        t.setUnitPrice(unitPrice);
        t.setFees(fees != null ? fees : BigDecimal.ZERO);
        if (currency != null) t.setCurrency(currency);
        t.setNotes(notes);
        return transactionRepository.save(t);
    }

    @Transactional
    public void delete(UUID portfolioId, UUID transactionId) {
        Transaction t = transactionRepository.findById(transactionId)
                .orElseThrow(() -> new IllegalArgumentException("Transaction not found"));
        if (!t.getPortfolioId().equals(portfolioId)) {
            throw new IllegalArgumentException("Transaction does not belong to this portfolio");
        }
        transactionRepository.delete(t);
    }

    private void validateSellQuantity(UUID portfolioId, String ticker, BigDecimal sellQty, LocalDate sellDate) {
        List<Transaction> history = transactionRepository
                .findByPortfolioIdAndTickerOrderByDate(portfolioId, ticker);
        BigDecimal held = history.stream()
                .filter(t -> !t.getDate().isAfter(sellDate))
                .map(t -> switch (t.getType()) {
                    case BUY, TRANSFER_IN -> t.getQuantity();
                    case SELL, TRANSFER_OUT -> t.getQuantity().negate();
                    default -> BigDecimal.ZERO;
                })
                .reduce(BigDecimal.ZERO, BigDecimal::add);
        if (sellQty.compareTo(held) > 0) {
            throw new IllegalArgumentException(
                    "Sell quantity " + sellQty + " exceeds held quantity " + held + " for " + ticker);
        }
    }
}
