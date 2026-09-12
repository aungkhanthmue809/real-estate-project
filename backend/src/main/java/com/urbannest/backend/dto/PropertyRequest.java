package com.urbannest.backend.dto;

import com.urbannest.backend.entity.OwnershipType;
import com.urbannest.backend.entity.PropertyType;
import com.urbannest.backend.entity.SaleStatus;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.util.Set;

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
    private Integer parking;
    private Integer yearBuilt;
    private OwnershipType ownershipType;
    private String streetAddress;
    private String township;
    private String city;
    private String stateRegion;
    private String zipCode;
    private Boolean hasGrant;
    private Boolean hasPermit;
    private Double latitude;
    private Double longitude;
    private Set<String> features;
    private String imageUrl;
    private String nrcDocumentToken;
    private String ownershipDocumentToken;
}
