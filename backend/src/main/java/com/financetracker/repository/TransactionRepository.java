package com.financetracker.repository;

import com.financetracker.model.Transaction;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

public interface TransactionRepository extends JpaRepository<Transaction, Long> {

    List<Transaction> findByUserIdOrderByDateDesc(Long userId);

    @Query("SELECT COALESCE(t.category.name, 'Uncategorized'), SUM(t.amount) " +
           "FROM Transaction t " +
           "WHERE t.user.id = :userId AND t.type = 'EXPENSE' " +
           "AND t.date BETWEEN :start AND :end " +
           "GROUP BY t.category.name")
    List<Object[]> findSpendingByCategory(
            @Param("userId") Long userId,
            @Param("start") LocalDate start,
            @Param("end") LocalDate end);

    @Query("SELECT t.category.id, SUM(t.amount) FROM Transaction t " +
           "WHERE t.user.id = :userId AND t.type = 'EXPENSE' " +
           "AND t.date BETWEEN :start AND :end " +
           "AND t.category IS NOT NULL " +
           "GROUP BY t.category.id")
    List<Object[]> findSpendingByCategoryIdForPeriod(
            @Param("userId") Long userId,
            @Param("start") LocalDate start,
            @Param("end") LocalDate end);

    @Query(value = "SELECT EXTRACT(YEAR FROM date)::int, EXTRACT(MONTH FROM date)::int, type, SUM(amount) " +
                   "FROM transactions WHERE user_id = :userId AND date >= :since " +
                   "GROUP BY EXTRACT(YEAR FROM date)::int, EXTRACT(MONTH FROM date)::int, type " +
                   "ORDER BY 1, 2", nativeQuery = true)
    List<Object[]> findMonthlySummary(@Param("userId") Long userId, @Param("since") LocalDate since);

    @Query("SELECT COALESCE(SUM(t.amount), 0) FROM Transaction t " +
           "WHERE t.user.id = :userId AND t.type = :type")
    BigDecimal sumByUserIdAndType(
            @Param("userId") Long userId,
            @Param("type") String type);
}
