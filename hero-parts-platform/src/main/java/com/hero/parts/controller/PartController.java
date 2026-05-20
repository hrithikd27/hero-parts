package com.hero.parts.controller;

import com.hero.parts.dto.AliasCreateRequest;
import com.hero.parts.dto.ApiResponse;
import com.hero.parts.dto.PartCreateRequest;
import com.hero.parts.dto.PartDTO;
import com.hero.parts.service.PartService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/parts")
@RequiredArgsConstructor
@Tag(name = "Parts", description = "CRUD operations for Hero MotoCorp spare parts")
public class PartController {

    private final PartService partService;

    @GetMapping
    @Operation(summary = "List all parts (paginated, optionally filtered by category and/or model)")
    public ResponseEntity<ApiResponse<Page<PartDTO>>> getAll(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size,
            @RequestParam(defaultValue = "name") String sortBy,
            @RequestParam(required = false) Long categoryId,
            @RequestParam(required = false) String model) {
        Page<PartDTO> parts = partService.getAllPaged(
                PageRequest.of(page, size, Sort.by(sortBy)), categoryId, model);
        return ResponseEntity.ok(ApiResponse.ok(parts));
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get part by internal ID")
    public ResponseEntity<ApiResponse<PartDTO>> getById(@PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.ok(partService.getById(id)));
    }

    @GetMapping("/sku/{sku}")
    @Operation(summary = "Get part by SKU")
    public ResponseEntity<ApiResponse<PartDTO>> getBySku(@PathVariable String sku) {
        return ResponseEntity.ok(ApiResponse.ok(partService.getBySku(sku)));
    }

    @GetMapping("/category/{categoryId}")
    @Operation(summary = "Get all parts in a category")
    public ResponseEntity<ApiResponse<List<PartDTO>>> getByCategory(@PathVariable Long categoryId) {
        return ResponseEntity.ok(ApiResponse.ok(partService.getByCategory(categoryId)));
    }

    @GetMapping("/in-stock")
    @Operation(summary = "Get all in-stock parts")
    public ResponseEntity<ApiResponse<List<PartDTO>>> getInStock() {
        return ResponseEntity.ok(ApiResponse.ok(partService.getInStock()));
    }

    @GetMapping("/compatible/{model}")
    @Operation(summary = "Get all parts compatible with a given bike model",
               description = "Model name is matched case-insensitively (e.g. 'Splendor Plus', 'HF Deluxe')")
    public ResponseEntity<ApiResponse<List<PartDTO>>> getByCompatibleModel(@PathVariable String model) {
        return ResponseEntity.ok(ApiResponse.ok(partService.getByCompatibleModel(model)));
    }

    @PostMapping
    @Operation(summary = "Create a new part")
    public ResponseEntity<ApiResponse<PartDTO>> create(@Valid @RequestBody PartCreateRequest req) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.ok("Part created successfully", partService.create(req)));
    }

    @PutMapping("/{id}")
    @Operation(summary = "Update an existing part")
    public ResponseEntity<ApiResponse<PartDTO>> update(
            @PathVariable Long id,
            @Valid @RequestBody PartCreateRequest req) {
        return ResponseEntity.ok(
                ApiResponse.ok("Part updated successfully", partService.update(id, req)));
    }

    @PatchMapping("/{id}/stock")
    @Operation(summary = "Update stock quantity and availability for a part")
    public ResponseEntity<ApiResponse<PartDTO>> updateStock(
            @PathVariable Long id,
            @RequestParam int qty,
            @RequestParam(defaultValue = "true") boolean inStock) {
        return ResponseEntity.ok(ApiResponse.ok("Stock updated", partService.updateStock(id, qty, inStock)));
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "Delete a part")
    public ResponseEntity<ApiResponse<Void>> delete(@PathVariable Long id) {
        partService.delete(id);
        return ResponseEntity.ok(ApiResponse.ok("Part deleted successfully", null));
    }

    // Alias endpoints
    @PostMapping("/aliases")
    @Operation(summary = "Add a search alias to a part")
    public ResponseEntity<ApiResponse<PartDTO>> addAlias(@Valid @RequestBody AliasCreateRequest req) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.ok("Alias added", partService.addAlias(req)));
    }

    @DeleteMapping("/aliases/{aliasId}")
    @Operation(summary = "Remove a search alias")
    public ResponseEntity<ApiResponse<Void>> deleteAlias(@PathVariable Long aliasId) {
        partService.deleteAlias(aliasId);
        return ResponseEntity.ok(ApiResponse.ok("Alias removed", null));
    }
}