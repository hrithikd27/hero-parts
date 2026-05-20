package com.hero.parts.controller;

import com.hero.parts.dto.ApiResponse;
import com.hero.parts.dto.DealerDTO;
import com.hero.parts.service.DealerService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/dealers")
@RequiredArgsConstructor
@Tag(name = "Dealers", description = "Hero MotoCorp dealer and service centre management")
public class DealerController {

    private final DealerService dealerService;

    @GetMapping
    @Operation(summary = "List all dealers")
    public ResponseEntity<ApiResponse<List<DealerDTO>>> getAll() {
        return ResponseEntity.ok(ApiResponse.ok(dealerService.getAll()));
    }

    @GetMapping("/active")
    @Operation(summary = "List active dealers only")
    public ResponseEntity<ApiResponse<List<DealerDTO>>> getActive() {
        return ResponseEntity.ok(ApiResponse.ok(dealerService.getActive()));
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get dealer by internal ID")
    public ResponseEntity<ApiResponse<DealerDTO>> getById(@PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.ok(dealerService.getById(id)));
    }

    @GetMapping("/code/{code}")
    @Operation(summary = "Get dealer by dealer code")
    public ResponseEntity<ApiResponse<DealerDTO>> getByCode(@PathVariable String code) {
        return ResponseEntity.ok(ApiResponse.ok(dealerService.getByCode(code)));
    }

    @GetMapping("/city/{city}")
    @Operation(summary = "Get dealers in a specific city")
    public ResponseEntity<ApiResponse<List<DealerDTO>>> getByCity(@PathVariable String city) {
        return ResponseEntity.ok(ApiResponse.ok(dealerService.getByCity(city)));
    }

    @PostMapping
    @Operation(summary = "Register a new dealer")
    public ResponseEntity<ApiResponse<DealerDTO>> create(@Valid @RequestBody DealerDTO req) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.ok("Dealer registered", dealerService.create(req)));
    }

    @PutMapping("/{id}")
    @Operation(summary = "Update dealer information")
    public ResponseEntity<ApiResponse<DealerDTO>> update(
            @PathVariable Long id, @Valid @RequestBody DealerDTO req) {
        return ResponseEntity.ok(ApiResponse.ok("Dealer updated", dealerService.update(id, req)));
    }

    @PatchMapping("/{id}/toggle-active")
    @Operation(summary = "Toggle dealer active status")
    public ResponseEntity<ApiResponse<Void>> toggleActive(@PathVariable Long id) {
        dealerService.toggleActive(id);
        return ResponseEntity.ok(ApiResponse.ok("Dealer status toggled", null));
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "Delete a dealer")
    public ResponseEntity<ApiResponse<Void>> delete(@PathVariable Long id) {
        dealerService.delete(id);
        return ResponseEntity.ok(ApiResponse.ok("Dealer deleted", null));
    }
}