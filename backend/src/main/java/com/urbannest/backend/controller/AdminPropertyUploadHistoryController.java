package com.urbannest.backend.controller;

import com.urbannest.backend.dto.PropertyUploadHistoryResponse;
import com.urbannest.backend.entity.ApprovalStatus;
import com.urbannest.backend.entity.PropertyType;
import com.urbannest.backend.entity.SaleStatus;
import com.urbannest.backend.service.PropertyUploadHistoryService;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.time.*;

@RestController
@RequestMapping("/api/admin/property-upload-history")
@RequiredArgsConstructor
public class AdminPropertyUploadHistoryController {
    private final PropertyUploadHistoryService historyService;

    @GetMapping
    public ResponseEntity<PropertyUploadHistoryResponse> search(
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate from,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate to,
            @RequestParam(required = false) PropertyType propertyType,
            @RequestParam(required = false) SaleStatus listingStatus,
            @RequestParam(required = false) ApprovalStatus approvalStatus,
            @RequestParam(required = false) String township,
            @RequestParam(required = false) String search,
            @RequestParam(defaultValue = "NEWEST") String sort,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        ZoneId zone = ZoneId.systemDefault();
        Instant fromDate = from == null ? null : from.atStartOfDay(zone).toInstant();
        Instant toDate = to == null ? null : to.plusDays(1).atStartOfDay(zone).toInstant();
        return ResponseEntity.ok(historyService.search(fromDate, toDate, propertyType, listingStatus, approvalStatus,
                township, search, sort, page, size));
    }
}
