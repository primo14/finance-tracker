package com.financetracker.service;

import com.financetracker.dto.SummaryDto;
import com.financetracker.dto.TransactionDto;
import com.financetracker.model.Transaction;
import com.financetracker.model.User;
import com.financetracker.repository.CategoryRepository;
import com.financetracker.repository.TransactionRepository;
import com.financetracker.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import java.util.NoSuchElementException;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class TransactionService {

    private final TransactionRepository transactionRepository;
    private final CategoryRepository categoryRepository;
    private final UserRepository userRepository;

    public List<TransactionDto> getAll(String email) {
        User user = requireUser(email);
        return transactionRepository.findByUserIdOrderByDateDesc(user.getId())
                .stream().map(this::toDto).collect(Collectors.toList());
    }

    public TransactionDto create(String email, TransactionDto dto) {
        User user = requireUser(email);
        Transaction t = Transaction.builder()
                .user(user)
                .amount(dto.getAmount())
                .type(dto.getType())
                .description(dto.getDescription())
                .date(dto.getDate())
                .build();
        if (dto.getCategoryId() != null) {
            categoryRepository.findById(dto.getCategoryId()).ifPresent(t::setCategory);
        }
        return toDto(transactionRepository.save(t));
    }

    public TransactionDto update(String email, Long id, TransactionDto dto) {
        Transaction t = requireOwned(email, id);
        t.setAmount(dto.getAmount());
        t.setType(dto.getType());
        t.setDescription(dto.getDescription());
        t.setDate(dto.getDate());
        if (dto.getCategoryId() != null) {
            categoryRepository.findById(dto.getCategoryId()).ifPresent(t::setCategory);
        } else {
            t.setCategory(null);
        }
        return toDto(transactionRepository.save(t));
    }

    public void delete(String email, Long id) {
        transactionRepository.delete(requireOwned(email, id));
    }

    public SummaryDto getSummary(String email) {
        User user = requireUser(email);
        BigDecimal income = transactionRepository.sumByUserIdAndType(user.getId(), "INCOME");
        BigDecimal expenses = transactionRepository.sumByUserIdAndType(user.getId(), "EXPENSE");
        income = income != null ? income : BigDecimal.ZERO;
        expenses = expenses != null ? expenses : BigDecimal.ZERO;

        LocalDate start = LocalDate.now().withDayOfMonth(1);
        LocalDate end = LocalDate.now();
        List<SummaryDto.CategoryBreakdown> breakdown = transactionRepository
                .findSpendingByCategory(user.getId(), start, end)
                .stream()
                .map(row -> new SummaryDto.CategoryBreakdown((String) row[0], (BigDecimal) row[1]))
                .collect(Collectors.toList());

        return new SummaryDto(income, expenses, income.subtract(expenses), breakdown);
    }

    private User requireUser(String email) {
        return userRepository.findByEmail(email).orElseThrow();
    }

    private Transaction requireOwned(String email, Long id) {
        User user = requireUser(email);
        return transactionRepository.findById(id)
                .filter(t -> t.getUser().getId().equals(user.getId()))
                .orElseThrow(() -> new NoSuchElementException("Transaction not found"));
    }

    private TransactionDto toDto(Transaction t) {
        TransactionDto dto = new TransactionDto();
        dto.setId(t.getId());
        dto.setAmount(t.getAmount());
        dto.setType(t.getType());
        dto.setDescription(t.getDescription());
        dto.setDate(t.getDate());
        if (t.getCategory() != null) {
            dto.setCategoryId(t.getCategory().getId());
            dto.setCategoryName(t.getCategory().getName());
        }
        return dto;
    }
}
