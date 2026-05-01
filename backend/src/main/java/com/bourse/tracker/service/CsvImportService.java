package com.bourse.tracker.service;

import com.bourse.tracker.enums.EnveloppeType;
import com.bourse.tracker.enums.TransactionType;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.BufferedReader;
import java.io.InputStreamReader;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.*;

/**
 * US-104: Import CSV broker avec mapping configurable.
 */
@Service
@Slf4j
@RequiredArgsConstructor
public class CsvImportService {

    private final TransactionService transactionService;

    public record CsvColumnMapping(
            int tickerCol, int dateCol, int typeCol, int quantityCol,
            int unitPriceCol, int feesCol, int enveloppeCol, int currencyCol,
            String dateFormat, String delimiter
    ) {
        public static CsvColumnMapping defaults() {
            return new CsvColumnMapping(0, 1, 2, 3, 4, 5, 6, 7, "dd/MM/yyyy", ";");
        }
    }

    public record ImportPreview(List<PreviewRow> rows, List<String> errors) {
        public record PreviewRow(String ticker, LocalDate date, String type,
                                  BigDecimal quantity, BigDecimal unitPrice,
                                  BigDecimal fees, String enveloppe, boolean valid, String error) {}
    }

    public ImportPreview preview(MultipartFile file, CsvColumnMapping mapping) {
        List<ImportPreview.PreviewRow> rows = new ArrayList<>();
        List<String> errors = new ArrayList<>();
        DateTimeFormatter fmt = DateTimeFormatter.ofPattern(mapping.dateFormat());
        try (BufferedReader reader = new BufferedReader(new InputStreamReader(file.getInputStream()))) {
            String line;
            boolean first = true;
            int lineNum = 0;
            while ((line = reader.readLine()) != null) {
                lineNum++;
                if (first) { first = false; continue; } // skip header
                String[] cols = line.split(mapping.delimiter(), -1);
                try {
                    String ticker = cols[mapping.tickerCol()].trim().toUpperCase();
                    LocalDate date = LocalDate.parse(cols[mapping.dateCol()].trim(), fmt);
                    String type = cols[mapping.typeCol()].trim().toUpperCase();
                    BigDecimal qty = new BigDecimal(cols[mapping.quantityCol()].trim().replace(",", "."));
                    BigDecimal price = new BigDecimal(cols[mapping.unitPriceCol()].trim().replace(",", "."));
                    BigDecimal fees = mapping.feesCol() >= 0 && mapping.feesCol() < cols.length
                            ? new BigDecimal(cols[mapping.feesCol()].trim().replace(",", "."))
                            : BigDecimal.ZERO;
                    String enveloppe = mapping.enveloppeCol() >= 0 && mapping.enveloppeCol() < cols.length
                            ? cols[mapping.enveloppeCol()].trim().toUpperCase() : "CTO";
                    rows.add(new ImportPreview.PreviewRow(ticker, date, type, qty, price, fees, enveloppe, true, null));
                } catch (Exception e) {
                    errors.add("Line " + lineNum + ": " + e.getMessage());
                }
            }
        } catch (Exception e) {
            errors.add("File read error: " + e.getMessage());
        }
        return new ImportPreview(rows, errors);
    }

    public int importConfirmed(UUID portfolioId, ImportPreview preview) {
        int count = 0;
        Set<String> seen = new HashSet<>();
        for (ImportPreview.PreviewRow row : preview.rows()) {
            if (!row.valid()) continue;
            // Idempotence: skip duplicate rows
            String key = row.ticker() + row.date() + row.type() + row.quantity() + row.unitPrice();
            if (seen.contains(key)) continue;
            seen.add(key);
            try {
                transactionService.create(portfolioId, row.ticker(), null,
                        EnveloppeType.valueOf(row.enveloppe()),
                        TransactionType.valueOf(row.type()),
                        row.date(), row.quantity(), row.unitPrice(),
                        row.fees(), "EUR", null);
                count++;
            } catch (Exception e) {
                log.warn("Skipping row {}/{}: {}", row.ticker(), row.date(), e.getMessage());
            }
        }
        return count;
    }
}
