package com.urbannest.backend.repository;

import java.math.BigDecimal;

public interface PropertyUploadHistoryAggregateProjection {
    BigDecimal getTotalRevenue();

    long getFeeRecordedCount();

    long getLegacyFeeCount();
}
