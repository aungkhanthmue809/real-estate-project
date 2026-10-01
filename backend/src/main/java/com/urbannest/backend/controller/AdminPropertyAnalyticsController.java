package com.urbannest.backend.controller;

import com.urbannest.backend.dto.PropertyAnalyticsResponse;
import com.urbannest.backend.service.PropertyAnalyticsService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/admin/analytics")
@RequiredArgsConstructor
public class AdminPropertyAnalyticsController {

    private final PropertyAnalyticsService propertyAnalyticsService;

    @GetMapping("/properties")
    public ResponseEntity<PropertyAnalyticsResponse> getPropertyAnalytics() {
        return ResponseEntity.ok(propertyAnalyticsService.getPropertyAnalytics());
    }
}
