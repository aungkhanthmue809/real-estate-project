package com.urbannest.backend.dto;

import com.urbannest.backend.entity.ApprovalStatus;
import com.urbannest.backend.entity.OwnershipType;
import com.urbannest.backend.entity.PropertyType;
import com.urbannest.backend.entity.SaleStatus;
import lombok.AllArgsConstructor;
import lombok.Getter;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.List;

@Getter
@AllArgsConstructor
public class PropertyUploadHistoryResponse {
    private final List<Item> content;
    private final int page;
    private final int size;
    private final long totalElements;
    private final int totalPages;
    private final BigDecimal filteredPostingFeeTotal;
    private final long filteredFeeRecordedCount;
    private final long filteredLegacyFeeCount;

    @Getter
    @AllArgsConstructor
    public static class Item {
        private final Long propertyId;
        private final String title;
        private final PropertyType propertyType;
        private final SaleStatus listingType;
        private final String township;
        private final ApprovalStatus status;
        private final Long ownerId;
        private final String ownerUsername;
        private final Instant submittedAt;
        private final BigDecimal propertyPrice;
        private final BigDecimal postingFeeAtSubmission;
        private final String description;
        private final Integer bedrooms;
        private final Integer bathrooms;
        private final Double area;
        private final String streetAddress;
        private final String city;
        private final String stateRegion;
        private final String zipCode;
        private final OwnershipType ownershipType;
        private final Boolean hasGrant;
        private final Boolean hasPermit;
    }
}
