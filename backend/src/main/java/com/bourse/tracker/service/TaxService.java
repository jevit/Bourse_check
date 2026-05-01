package com.bourse.tracker.service;

import com.bourse.tracker.enums.EnveloppeType;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.time.temporal.ChronoUnit;

/**
 * Simulation fiscale simplifiée — US-401.
 * DISCLAIMER : estimation non contractuelle, ne se substitue pas à un conseil fiscal.
 */
@Service
@RequiredArgsConstructor
public class TaxService {

    // Flat tax PFU = 30% (12.8% IR + 17.2% prélèvements sociaux)
    private static final BigDecimal FLAT_TAX_RATE = new BigDecimal("0.30");
    // Prélèvements sociaux seuls
    private static final BigDecimal SOCIAL_RATE = new BigDecimal("0.172");
    // AV après 8 ans : 7.5% IR + 17.2% PS avec abattement 4600€/9200€
    private static final BigDecimal AV_IR_RATE = new BigDecimal("0.075");

    private final PositionService positionService;

    public TaxSimulation simulate(java.util.UUID portfolioId, String ticker,
                                   BigDecimal sellQty, BigDecimal sellPrice,
                                   EnveloppeType enveloppe, LocalDate openDate) {
        PositionService.PositionSnapshot pos = positionService.getPosition(portfolioId, ticker);
        BigDecimal grossGain = sellPrice.subtract(pos.pru()).multiply(sellQty);
        if (grossGain.compareTo(BigDecimal.ZERO) <= 0) {
            return new TaxSimulation(grossGain, BigDecimal.ZERO, BigDecimal.ZERO, grossGain,
                    "Moins-value — pas d'imposition", enveloppe.name());
        }

        long yearsHeld = openDate != null
                ? ChronoUnit.YEARS.between(openDate, LocalDate.now()) : 0;

        return switch (enveloppe) {
            case PEA -> simulatePea(grossGain, yearsHeld);
            case AV -> simulateAv(grossGain, yearsHeld);
            default -> simulateCto(grossGain);
        };
    }

    private TaxSimulation simulatePea(BigDecimal grossGain, long yearsHeld) {
        if (yearsHeld >= 5) {
            BigDecimal tax = grossGain.multiply(SOCIAL_RATE).setScale(2, RoundingMode.HALF_UP);
            return new TaxSimulation(grossGain, tax, SOCIAL_RATE,
                    grossGain.subtract(tax), "PEA ≥5 ans : exonéré IR, PS 17.2%", "PEA");
        }
        BigDecimal tax = grossGain.multiply(FLAT_TAX_RATE).setScale(2, RoundingMode.HALF_UP);
        return new TaxSimulation(grossGain, tax, FLAT_TAX_RATE,
                grossGain.subtract(tax), "PEA <5 ans : flat tax 30%", "PEA");
    }

    private TaxSimulation simulateCto(BigDecimal grossGain) {
        BigDecimal tax = grossGain.multiply(FLAT_TAX_RATE).setScale(2, RoundingMode.HALF_UP);
        return new TaxSimulation(grossGain, tax, FLAT_TAX_RATE,
                grossGain.subtract(tax), "CTO : flat tax 30% (PFU)", "CTO");
    }

    private TaxSimulation simulateAv(BigDecimal grossGain, long yearsHeld) {
        if (yearsHeld >= 8) {
            // Abattement annuel 4600€ (simplifié : appliqué intégralement)
            BigDecimal abattement = new BigDecimal("4600");
            BigDecimal taxableGain = grossGain.subtract(abattement).max(BigDecimal.ZERO);
            BigDecimal irTax = taxableGain.multiply(AV_IR_RATE);
            BigDecimal psTax = grossGain.multiply(SOCIAL_RATE);
            BigDecimal totalTax = irTax.add(psTax).setScale(2, RoundingMode.HALF_UP);
            BigDecimal effectiveRate = grossGain.compareTo(BigDecimal.ZERO) > 0
                    ? totalTax.divide(grossGain, 4, RoundingMode.HALF_UP) : BigDecimal.ZERO;
            return new TaxSimulation(grossGain, totalTax, effectiveRate,
                    grossGain.subtract(totalTax), "AV ≥8 ans : 7.5% IR (abattement 4600€) + 17.2% PS", "AV");
        }
        BigDecimal tax = grossGain.multiply(FLAT_TAX_RATE).setScale(2, RoundingMode.HALF_UP);
        return new TaxSimulation(grossGain, tax, FLAT_TAX_RATE,
                grossGain.subtract(tax), "AV <8 ans : flat tax 30%", "AV");
    }

    public record TaxSimulation(
            BigDecimal grossGain,
            BigDecimal taxAmount,
            BigDecimal effectiveRate,
            BigDecimal netGain,
            String regime,
            String enveloppe
    ) {}
}
