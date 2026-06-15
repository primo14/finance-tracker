package com.financetracker.controller;

import com.financetracker.dto.BudgetDto;
import com.financetracker.service.BudgetService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.security.Principal;
import java.util.List;

@RestController
@RequestMapping("/api/budgets")
@RequiredArgsConstructor
public class BudgetController {

    private final BudgetService budgetService;

    @GetMapping
    public ResponseEntity<List<BudgetDto>> getCurrentMonth(Principal principal) {
        return ResponseEntity.ok(budgetService.getCurrentMonthBudgets(principal.getName()));
    }

    @PostMapping
    public ResponseEntity<BudgetDto> upsert(Principal principal,
                                             @Valid @RequestBody BudgetDto dto) {
        return ResponseEntity.ok(budgetService.upsert(principal.getName(), dto));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(Principal principal, @PathVariable Long id) {
        budgetService.delete(principal.getName(), id);
        return ResponseEntity.noContent().build();
    }
}
