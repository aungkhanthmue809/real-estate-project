package com.urbannest.backend.repository;

import com.urbannest.backend.entity.PropertyType;

public interface PropertyTypeCountProjection {
    PropertyType getPropertyType();

    long getCount();
}
