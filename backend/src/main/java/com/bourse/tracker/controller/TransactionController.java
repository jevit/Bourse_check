package com.bourse.tracker.controller;

import com.bourse.tracker.domain.Transaction;
import com.bourse.tracker.dto.request.CreateTransactionRequest;
import com.bourse.tracker.service.CsvImportService;
import com.bourse.tracker.service.TransactionService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/portfolios/{portfolioId}/transactions")
@RequiredArgsConstructor
public class TransactionController {

    private final TransactionService transactionService;
    private final CsvImportService csvImportService;

    @GetMapping
    public List<Transaction> list(@PathVariable UUID portfolioId) {
        return transactionService.findByPortfolio(portfolioId);
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public Transaction create(@PathVariable UUID portfolioId,
                               @Valid @RequestBody CreateTransactionRequest req) {
        return transactionService.create(portfolioId, req.ticker(), req.instrumentName(),
                req.enveloppe(), req.type(), req.date(), req.quantity(),
                req.unitPrice(), req.fees(), req.currency(), req.notes());
    }

    @PutMapping("/{transactionId}")
    public Transaction update(@PathVariable UUID portfolioId,
                               @PathVariable UUID transactionId,
                               @Valid @RequestBody CreateTransactionRequest req) {
        return transactionService.update(portfolioId, transactionId, req.enveloppe(),
                req.type(), req.date(), req.quantity(), req.unitPrice(),
                req.fees(), req.currency(), req.notes());
    }

    @DeleteMapping("/{transactionId}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void delete(@PathVariable UUID portfolioId, @PathVariable UUID transactionId) {
        transactionService.delete(portfolioId, transactionId);
    }

    // US-104: Import CSV
    @PostMapping("/import/preview")
    public CsvImportService.ImportPreview previewCsv(
            @PathVariable UUID portfolioId,
            @RequestParam("file") MultipartFile file,
            @RequestParam(defaultValue = "0") int tickerCol,
            @RequestParam(defaultValue = "1") int dateCol,
            @RequestParam(defaultValue = "2") int typeCol,
            @RequestParam(defaultValue = "3") int quantityCol,
            @RequestParam(defaultValue = "4") int unitPriceCol,
            @RequestParam(defaultValue = "5") int feesCol,
            @RequestParam(defaultValue = "6") int enveloppeCol,
            @RequestParam(defaultValue = "dd/MM/yyyy") String dateFormat,
            @RequestParam(defaultValue = ";") String delimiter) {
        CsvImportService.CsvColumnMapping mapping = new CsvImportService.CsvColumnMapping(
                tickerCol, dateCol, typeCol, quantityCol, unitPriceCol, feesCol, -1, -1, dateFormat, delimiter);
        return csvImportService.preview(file, mapping);
    }

    @PostMapping("/import/confirm")
    public ResponseEntity<Map<String, Object>> confirmImport(
            @PathVariable UUID portfolioId,
            @RequestBody CsvImportService.ImportPreview preview) {
        int imported = csvImportService.importConfirmed(portfolioId, preview);
        return ResponseEntity.ok(Map.of("imported", imported));
    }
}
