package com.urbannest.backend.service;

import com.urbannest.backend.dto.PropertyUploadHistoryResponse;
import com.urbannest.backend.entity.ApprovalStatus;
import com.urbannest.backend.entity.Property;
import com.urbannest.backend.entity.PropertyType;
import com.urbannest.backend.entity.SaleStatus;
import com.urbannest.backend.repository.PropertyRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.Instant;

@Service
@RequiredArgsConstructor
public class PropertyUploadHistoryService {
    private static final int DEFAULT_PAGE_SIZE = 20;
    private static final int MAX_PAGE_SIZE = 100;
    private static final Instant ALL_TIME_START = Instant.parse("1900-01-01T00:00:00Z");
    private static final Instant ALL_TIME_END = Instant.parse("9999-12-31T23:59:59Z");

    private final PropertyRepository propertyRepository;

    @Transactional(readOnly = true)
    public PropertyUploadHistoryResponse search(Instant fromDate, Instant toDate, PropertyType propertyType,
                                                SaleStatus listingStatus, ApprovalStatus approvalStatus,
                                                String township, String search, String sort, int page, int size) {
        int safePage = Math.max(page, 0);
        int safeSize = size <= 0 ? DEFAULT_PAGE_SIZE : Math.min(size, MAX_PAGE_SIZE);
        Instant safeFromDate = fromDate == null ? ALL_TIME_START : fromDate;
        Instant safeToDate = toDate == null ? ALL_TIME_END : toDate;
        String safeSearch = normalize(search);
        String safeTownship = normalize(township);
        String safeSort = switch (sort == null ? "" : sort) {
            case "OLDEST", "POSTING_FEE_DESC", "POSTING_FEE_ASC", "PROPERTY_PRICE_DESC", "PROPERTY_PRICE_ASC" -> sort;
            default -> "NEWEST";
        };
        Pageable pageable = PageRequest.of(safePage, safeSize);
        Page<Property> results = propertyRepository.searchUploadHistory(
                safeFromDate, safeToDate, propertyType, listingStatus, approvalStatus, safeTownship,
                safeSearch, safeSort, pageable);
        var aggregate = propertyRepository.aggregateUploadHistory(
                safeFromDate, safeToDate, propertyType, listingStatus, approvalStatus, safeTownship, safeSearch);
        return new PropertyUploadHistoryResponse(
                results.getContent().stream().map(this::toItem).toList(),
                results.getNumber(), results.getSize(), results.getTotalElements(), results.getTotalPages(),
                zeroIfNull(aggregate.getTotalRevenue()), aggregate.getFeeRecordedCount(), aggregate.getLegacyFeeCount());
    }

    private PropertyUploadHistoryResponse.Item toItem(Property property) {
        return new PropertyUploadHistoryResponse.Item(
                property.getId(), property.getTitle(), property.getPropertyType(), property.getStatus(),
                property.getTownship(), property.getApprovalStatus(), property.getOwner().getId(),
                property.getOwner().getUsername(), property.getCreatedAt(), property.getPrice(),
                property.getPostingFeeAtSubmission(), property.getDescription(), property.getBedrooms(),
                property.getBathrooms(), property.getArea(), property.getStreetAddress(), property.getCity(),
                property.getStateRegion(), property.getZipCode(), property.getOwnershipType(),
                property.getHasGrant(), property.getHasPermit());
    }

    private String normalize(String value) {
        if (value == null || value.isBlank()) return null;
        return value.trim();
    }

    private BigDecimal zeroIfNull(BigDecimal value) {
        return value == null ? BigDecimal.ZERO : value;
    }
}
