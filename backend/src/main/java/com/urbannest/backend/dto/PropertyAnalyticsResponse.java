package com.urbannest.backend.dto;

import com.urbannest.backend.entity.PropertyType;
import lombok.AllArgsConstructor;
import lombok.Getter;

import java.math.BigDecimal;
import java.util.List;

@Getter
@AllArgsConstructor
public class PropertyAnalyticsResponse {
    private final long totalProperties;
    private final long pendingProperties;
    private final long approvedProperties;
    private final long rejectedProperties;
    private final BigDecimal totalPostingFeeRevenue;
    private final long feeRecordedListings;
    private final long legacyListingsWithoutFee;
    private final List<PropertyTypeRevenue> revenueByPropertyType;
    private final List<PropertyTypeDistribution> propertyDistribution;

    @Getter
    @AllArgsConstructor
    public static class PropertyTypeRevenue {
        private final PropertyType propertyType;
        private final long count;
        private final BigDecimal revenue;
    }

    @Getter
    @AllArgsConstructor
    public static class PropertyTypeDistribution {
        private final PropertyType propertyType;
        private final long count;
    }
}
