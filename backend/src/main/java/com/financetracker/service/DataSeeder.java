package com.financetracker.service;

import com.financetracker.model.Category;
import com.financetracker.repository.CategoryRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.stereotype.Component;

import java.util.List;

@Component
@RequiredArgsConstructor
public class DataSeeder implements ApplicationRunner {

    private final CategoryRepository categoryRepository;

    @Override
    public void run(ApplicationArguments args) {
        if (categoryRepository.count() > 0) return;

        List<Category> defaults = List.of(
                Category.builder().name("Food & Dining").type("EXPENSE").icon("🍔").build(),
                Category.builder().name("Transportation").type("EXPENSE").icon("🚗").build(),
                Category.builder().name("Shopping").type("EXPENSE").icon("🛍️").build(),
                Category.builder().name("Entertainment").type("EXPENSE").icon("🎬").build(),
                Category.builder().name("Health").type("EXPENSE").icon("🏥").build(),
                Category.builder().name("Utilities").type("EXPENSE").icon("💡").build(),
                Category.builder().name("Rent / Housing").type("EXPENSE").icon("🏠").build(),
                Category.builder().name("Salary").type("INCOME").icon("💼").build(),
                Category.builder().name("Freelance").type("INCOME").icon("💻").build(),
                Category.builder().name("Other Income").type("INCOME").icon("💰").build()
        );
        categoryRepository.saveAll(defaults);
    }
}
