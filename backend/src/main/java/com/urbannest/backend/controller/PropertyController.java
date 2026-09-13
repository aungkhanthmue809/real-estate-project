package com.urbannest.backend.controller;

import com.urbannest.backend.dto.PropertyRequest;
import com.urbannest.backend.dto.PropertyResponse;
import com.urbannest.backend.entity.PropertyType;
import com.urbannest.backend.entity.SaleStatus;
import com.urbannest.backend.service.PropertyService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/properties")
@RequiredArgsConstructor
public class PropertyController {

    private final PropertyService propertyService;

    @GetMapping
    public ResponseEntity<List<PropertyResponse>> searchProperties(
            @RequestParam(required = false) String keyword,
            @RequestParam(required = false) PropertyType type,
            @RequestParam(required = false) SaleStatus status,
            @RequestParam(required = false) String location,
            @RequestParam(required = false) BigDecimal minPrice,
            @RequestParam(required = false) BigDecimal maxPrice) {
        return ResponseEntity.ok(propertyService.searchProperties(keyword, type, status, location, minPrice, maxPrice));
    }

    @GetMapping("/{id}")
    public ResponseEntity<PropertyResponse> getPropertyById(@PathVariable Long id) {
        return ResponseEntity.ok(propertyService.getPropertyById(id));
    }

    @GetMapping("/mine")
    public ResponseEntity<List<PropertyResponse>> getMyProperties() {
        return ResponseEntity.ok(propertyService.getMyProperties());
    }

    @PostMapping
    public ResponseEntity<PropertyResponse> createProperty(@Valid @RequestBody PropertyRequest request) {
        return ResponseEntity.ok(propertyService.createProperty(request));
    }

    @PutMapping("/{id}")
    public ResponseEntity<PropertyResponse> updateProperty(@PathVariable Long id, @Valid @RequestBody PropertyRequest request) {
        return ResponseEntity.ok(propertyService.updateProperty(id, request));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Map<String, String>> deleteProperty(@PathVariable Long id) {
        String message = propertyService.deleteProperty(id);
        return ResponseEntity.ok(Map.of("message", message));
    }
}
