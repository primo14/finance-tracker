package com.financetracker.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDate;

@Data
public class TransactionDto {
    private Long id;

    @NotNull @Positive
    private BigDecimal amount;

    @NotBlank
    private String type; // INCOME or EXPENSE

    private String description;

    @NotNull
    private LocalDate date;

    private Long categoryId;
    private String categoryName;
}
