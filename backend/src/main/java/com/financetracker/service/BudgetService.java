package com.financetracker.service;

import com.financetracker.dto.BudgetDto;
import com.financetracker.model.Budget;
import com.financetracker.model.Category;
import com.financetracker.model.User;
import com.financetracker.repository.BudgetRepository;
import com.financetracker.repository.CategoryRepository;
import com.financetracker.repository.TransactionRepository;
import com.financetracker.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import java.util.Map;
import java.util.NoSuchElementException;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class BudgetService {

    private final BudgetRepository budgetRepository;
    private final CategoryRepository categoryRepository;
    private final TransactionRepository transactionRepository;
    private final UserRepository userRepository;

    public List<BudgetDto> getCurrentMonthBudgets(String email) {
        User user = requireUser(email);
        LocalDate now = LocalDate.now();
        Map<Long, BigDecimal> spendingMap = buildSpendingMap(user.getId(), now);

        return budgetRepository
                .findByUserIdAndMonthAndYear(user.getId(), now.getMonthValue(), now.getYear())
                .stream()
                .map(b -> toDto(b, spendingMap.getOrDefault(b.getCategory().getId(), BigDecimal.ZERO)))
                .collect(Collectors.toList());
    }

    public BudgetDto upsert(String email, BudgetDto dto) {
        User user = requireUser(email);
        LocalDate now = LocalDate.now();

        Category category = categoryRepository.findById(dto.getCategoryId())
                .orElseThrow(() -> new NoSuchElementException("Category not found"));

        Budget budget = budgetRepository
                .findByUserIdAndCategoryIdAndMonthAndYear(
                        user.getId(), dto.getCategoryId(), now.getMonthValue(), now.getYear())
                .orElse(Budget.builder()
                        .user(user).category(category)
                        .month(now.getMonthValue()).year(now.getYear())
                        .build());

        budget.setLimitAmount(dto.getLimitAmount());

        BigDecimal spent = buildSpendingMap(user.getId(), now)
                .getOrDefault(dto.getCategoryId(), BigDecimal.ZERO);

        return toDto(budgetRepository.save(budget), spent);
    }

    public void delete(String email, Long id) {
        User user = requireUser(email);
        Budget budget = budgetRepository.findById(id)
                .filter(b -> b.getUser().getId().equals(user.getId()))
                .orElseThrow(() -> new NoSuchElementException("Budget not found"));
        budgetRepository.delete(budget);
    }

    private Map<Long, BigDecimal> buildSpendingMap(Long userId, LocalDate now) {
        LocalDate start = now.withDayOfMonth(1);
        return transactionRepository
                .findSpendingByCategoryIdForPeriod(userId, start, now)
                .stream()
                .collect(Collectors.toMap(row -> (Long) row[0], row -> (BigDecimal) row[1]));
    }

    private User requireUser(String email) {
        return userRepository.findByEmail(email).orElseThrow();
    }

    private BudgetDto toDto(Budget b, BigDecimal spent) {
        BudgetDto dto = new BudgetDto();
        dto.setId(b.getId());
        dto.setCategoryId(b.getCategory().getId());
        dto.setCategoryName(b.getCategory().getName());
        dto.setLimitAmount(b.getLimitAmount());
        dto.setSpentAmount(spent);
        dto.setMonth(b.getMonth());
        dto.setYear(b.getYear());
        return dto;
    }
}
