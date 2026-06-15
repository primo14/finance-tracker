package com.financetracker.dto;

import lombok.AllArgsConstructor;
import lombok.Data;

import java.math.BigDecimal;

@Data
@AllArgsConstructor
public class MonthlyDataDto {
    private String month;
    private BigDecimal income;
    private BigDecimal expenses;
}
