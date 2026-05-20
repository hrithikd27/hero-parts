package com.hero.parts.controller;

import com.hero.parts.dto.ApiResponse;
import com.hero.parts.dto.CategoryDTO;
import com.hero.parts.service.CategoryService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/categories")
@RequiredArgsConstructor
@Validated
@Tag(name = "Categories", description = "Part category management")
public class CategoryController {

    private final CategoryService categoryService;

    @GetMapping
    @Operation(summary = "List all categories")
    public ResponseEntity<ApiResponse<List<CategoryDTO>>> getAll() {
        return ResponseEntity.ok(ApiResponse.ok(categoryService.getAll()));
    }

    @GetMapping("/top-level")
    @Operation(summary = "List top-level categories with their sub-categories")
    public ResponseEntity<ApiResponse<List<CategoryDTO>>> getTopLevel() {
        return ResponseEntity.ok(ApiResponse.ok(categoryService.getTopLevel()));
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get category by ID")
    public ResponseEntity<ApiResponse<CategoryDTO>> getById(@PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.ok(categoryService.getById(id)));
    }

    @PostMapping
    @Operation(summary = "Create a category")
    public ResponseEntity<ApiResponse<CategoryDTO>> create(
            @RequestParam @NotBlank @Size(max = 100) String name,
            @RequestParam(required = false) @Size(max = 255) String description,
            @RequestParam(required = false) Long parentId) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.ok("Category created", categoryService.create(name, description, parentId)));
    }

    @PutMapping("/{id}")
    @Operation(summary = "Update a category")
    public ResponseEntity<ApiResponse<CategoryDTO>> update(
            @PathVariable Long id,
            @RequestParam @NotBlank @Size(max = 100) String name,
            @RequestParam(required = false) @Size(max = 255) String description,
            @RequestParam(required = false) Long parentId) {
        return ResponseEntity.ok(
                ApiResponse.ok("Category updated", categoryService.update(id, name, description, parentId)));
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "Delete a category (only if no parts are assigned)")
    public ResponseEntity<ApiResponse<Void>> delete(@PathVariable Long id) {
        categoryService.delete(id);
        return ResponseEntity.ok(ApiResponse.ok("Category deleted", null));
    }
}