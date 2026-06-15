package com.financetracker.dto;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import lombok.Data;

import java.math.BigDecimal;

@Data
public class BudgetDto {
    private Long id;

    @NotNull
    private Long categoryId;
    private String categoryName;

    @NotNull @Positive
    private BigDecimal limitAmount;

    private BigDecimal spentAmount;
    private int month;
    private int year;
}
