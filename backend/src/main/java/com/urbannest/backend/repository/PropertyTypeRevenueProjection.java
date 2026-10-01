package com.urbannest.backend.repository;

import com.urbannest.backend.entity.PropertyType;

import java.math.BigDecimal;

public interface PropertyTypeRevenueProjection {
    PropertyType getPropertyType();

    long getCount();

    BigDecimal getRevenue();
}
