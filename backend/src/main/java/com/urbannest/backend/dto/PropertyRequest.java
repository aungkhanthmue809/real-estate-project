package com.urbannest.backend.dto;

import com.urbannest.backend.entity.PropertyType;
import com.urbannest.backend.entity.SaleStatus;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PropertyRequest {
    private String title;
    private String description;
    private BigDecimal price;
    private String location;
    private PropertyType propertyType;
    private SaleStatus status;
    private Integer bedrooms;
    private Integer bathrooms;
    private Double area;
    private String imageUrl;
}
