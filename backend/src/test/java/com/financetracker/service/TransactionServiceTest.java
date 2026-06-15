package com.financetracker.service;

import com.financetracker.dto.SummaryDto;
import com.financetracker.dto.TransactionDto;
import com.financetracker.model.Transaction;
import com.financetracker.model.User;
import com.financetracker.repository.CategoryRepository;
import com.financetracker.repository.TransactionRepository;
import com.financetracker.repository.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import java.util.NoSuchElementException;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class TransactionServiceTest {

    @Mock private TransactionRepository transactionRepository;
    @Mock private CategoryRepository categoryRepository;
    @Mock private UserRepository userRepository;
    @InjectMocks private TransactionService transactionService;

    private User testUser;

    @BeforeEach
    void setUp() {
        testUser = User.builder().id(1L).email("test@example.com").name("Test User").build();
    }

    @Test
    void create_savesTransactionAndReturnsDto() {
        when(userRepository.findByEmail("test@example.com")).thenReturn(Optional.of(testUser));

        TransactionDto dto = new TransactionDto();
        dto.setAmount(new BigDecimal("50.00"));
        dto.setType("EXPENSE");
        dto.setDescription("Groceries");
        dto.setDate(LocalDate.now());

        Transaction saved = Transaction.builder()
                .id(1L).user(testUser)
                .amount(dto.getAmount()).type(dto.getType())
                .description(dto.getDescription()).date(dto.getDate())
                .build();
        when(transactionRepository.save(any())).thenReturn(saved);

        TransactionDto result = transactionService.create("test@example.com", dto);

        assertThat(result.getId()).isEqualTo(1L);
        assertThat(result.getAmount()).isEqualByComparingTo("50.00");
        assertThat(result.getType()).isEqualTo("EXPENSE");
    }

    @Test
    void getSummary_calculatesBalanceCorrectly() {
        when(userRepository.findByEmail("test@example.com")).thenReturn(Optional.of(testUser));
        when(transactionRepository.sumByUserIdAndType(1L, "INCOME")).thenReturn(new BigDecimal("2000.00"));
        when(transactionRepository.sumByUserIdAndType(1L, "EXPENSE")).thenReturn(new BigDecimal("750.00"));
        when(transactionRepository.findSpendingByCategory(eq(1L), any(), any())).thenReturn(List.of());

        SummaryDto summary = transactionService.getSummary("test@example.com");

        assertThat(summary.getTotalIncome()).isEqualByComparingTo("2000.00");
        assertThat(summary.getTotalExpenses()).isEqualByComparingTo("750.00");
        assertThat(summary.getBalance()).isEqualByComparingTo("1250.00");
    }

    @Test
    void getSummary_handlesNullSumsAsZero() {
        when(userRepository.findByEmail("test@example.com")).thenReturn(Optional.of(testUser));
        when(transactionRepository.sumByUserIdAndType(any(), any())).thenReturn(null);
        when(transactionRepository.findSpendingByCategory(any(), any(), any())).thenReturn(List.of());

        SummaryDto summary = transactionService.getSummary("test@example.com");

        assertThat(summary.getBalance()).isEqualByComparingTo("0.00");
    }

    @Test
    void delete_throwsWhenTransactionBelongsToAnotherUser() {
        User other = User.builder().id(2L).email("other@example.com").build();
        Transaction transaction = Transaction.builder().id(5L).user(other).build();

        when(userRepository.findByEmail("test@example.com")).thenReturn(Optional.of(testUser));
        when(transactionRepository.findById(5L)).thenReturn(Optional.of(transaction));

        assertThatThrownBy(() -> transactionService.delete("test@example.com", 5L))
                .isInstanceOf(NoSuchElementException.class);
    }
}
