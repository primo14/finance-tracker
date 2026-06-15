package com.financetracker.controller;

import com.financetracker.model.Category;
import com.financetracker.repository.CategoryRepository;
import com.financetracker.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.security.Principal;
import java.util.List;

@RestController
@RequestMapping("/api/categories")
@RequiredArgsConstructor
public class CategoryController {

    private final CategoryRepository categoryRepository;
    private final UserRepository userRepository;

    @GetMapping
    public ResponseEntity<List<Category>> getAll(Principal principal) {
        Long userId = userRepository.findByEmail(principal.getName())
                .orElseThrow().getId();
        return ResponseEntity.ok(categoryRepository.findByUserIdOrUserIsNull(userId));
    }
}
