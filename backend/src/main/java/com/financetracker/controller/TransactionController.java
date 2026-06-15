package com.financetracker.controller;

import com.financetracker.dto.SummaryDto;
import com.financetracker.dto.TransactionDto;
import com.financetracker.service.TransactionService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.security.Principal;
import java.util.List;

@RestController
@RequestMapping("/api/transactions")
@RequiredArgsConstructor
public class TransactionController {

    private final TransactionService transactionService;

    @GetMapping
    public ResponseEntity<List<TransactionDto>> getAll(Principal principal) {
        return ResponseEntity.ok(transactionService.getAll(principal.getName()));
    }

    @GetMapping("/summary")
    public ResponseEntity<SummaryDto> getSummary(Principal principal) {
        return ResponseEntity.ok(transactionService.getSummary(principal.getName()));
    }

    @PostMapping
    public ResponseEntity<TransactionDto> create(Principal principal,
                                                  @Valid @RequestBody TransactionDto dto) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(transactionService.create(principal.getName(), dto));
    }

    @PutMapping("/{id}")
    public ResponseEntity<TransactionDto> update(Principal principal,
                                                  @PathVariable Long id,
                                                  @Valid @RequestBody TransactionDto dto) {
        return ResponseEntity.ok(transactionService.update(principal.getName(), id, dto));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(Principal principal, @PathVariable Long id) {
        transactionService.delete(principal.getName(), id);
        return ResponseEntity.noContent().build();
    }
}
