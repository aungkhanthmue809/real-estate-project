package com.urbannest.backend.dto;

import com.urbannest.backend.entity.ApprovalStatus;
import com.urbannest.backend.entity.PropertyType;
import com.urbannest.backend.entity.SaleStatus;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.Instant;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PropertyResponse {
    private Long id;
    private String title;
    private String description;
    private BigDecimal price;
    private String location;
    private PropertyType propertyType;
    private SaleStatus status;
    private ApprovalStatus approvalStatus;
    private Integer bedrooms;
    private Integer bathrooms;
    private Double area;
    private String imageUrl;
    private String owner;
    private String ownerPhone;
    private Instant createdAt;
}
