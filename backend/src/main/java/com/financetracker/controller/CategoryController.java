package com.financetracker.controller;

import com.financetracker.dto.CategoryDto;
import com.financetracker.model.Category;
import com.financetracker.model.User;
import com.financetracker.repository.CategoryRepository;
import com.financetracker.repository.TransactionRepository;
import com.financetracker.repository.UserRepository;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.security.Principal;
import java.util.List;
import java.util.NoSuchElementException;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/categories")
@RequiredArgsConstructor
public class CategoryController {

    private final CategoryRepository categoryRepository;
    private final TransactionRepository transactionRepository;
    private final UserRepository userRepository;

    @GetMapping
    public ResponseEntity<List<CategoryDto>> getAll(Principal principal) {
        User user = requireUser(principal);
        List<CategoryDto> result = categoryRepository.findByUserIdOrUserIsNull(user.getId())
                .stream().map(this::toDto).collect(Collectors.toList());
        return ResponseEntity.ok(result);
    }

    @PostMapping
    public ResponseEntity<CategoryDto> create(Principal principal, @Valid @RequestBody CategoryDto dto) {
        User user = requireUser(principal);
        Category category = Category.builder()
                .name(dto.getName().trim())
                .type(dto.getType().toUpperCase())
                .icon(dto.getIcon() != null ? dto.getIcon().trim() : "📁")
                .user(user)
                .build();
        return ResponseEntity.status(HttpStatus.CREATED).body(toDto(categoryRepository.save(category)));
    }

    @PutMapping("/{id}")
    public ResponseEntity<CategoryDto> update(Principal principal, @PathVariable Long id,
                                               @Valid @RequestBody CategoryDto dto) {
        User user = requireUser(principal);
        Category category = requireOwned(user, id);
        category.setName(dto.getName().trim());
        category.setType(dto.getType().toUpperCase());
        if (dto.getIcon() != null) category.setIcon(dto.getIcon().trim());
        return ResponseEntity.ok(toDto(categoryRepository.save(category)));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(Principal principal, @PathVariable Long id) {
        User user = requireUser(principal);
        Category category = requireOwned(user, id);
        transactionRepository.clearCategory(category.getId());
        categoryRepository.delete(category);
        return ResponseEntity.noContent().build();
    }

    private Category requireOwned(User user, Long id) {
        Category category = categoryRepository.findById(id)
                .orElseThrow(() -> new NoSuchElementException("Category not found"));
        if (category.getUser() == null || !category.getUser().getId().equals(user.getId())) {
            throw new IllegalArgumentException("Cannot modify a default category");
        }
        return category;
    }

    private User requireUser(Principal principal) {
        return userRepository.findByEmail(principal.getName()).orElseThrow();
    }

    private CategoryDto toDto(Category c) {
        CategoryDto dto = new CategoryDto();
        dto.setId(c.getId());
        dto.setName(c.getName());
        dto.setType(c.getType());
        dto.setIcon(c.getIcon());
        dto.setCustom(c.getUser() != null);
        return dto;
    }
}
