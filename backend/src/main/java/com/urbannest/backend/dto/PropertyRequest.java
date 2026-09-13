package com.urbannest.backend.dto;

import java.math.BigDecimal;
import java.util.Set;

import com.urbannest.backend.entity.OwnershipType;
import com.urbannest.backend.entity.PropertyType;
import com.urbannest.backend.entity.SaleStatus;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PropertyRequest {
    @NotBlank(message = "Title is required")
    @Size(max = 255, message = "Title is too long")
    private String title;

    @Size(max = 5000, message = "Description is too long")
    private String description;

    @NotNull(message = "Price is required")
    @Positive(message = "Price must be positive")
    private BigDecimal price;

    @NotBlank(message = "Location is required")
    @Size(max = 500, message = "Location is too long")
    private String location;

    @NotNull(message = "Property type is required")
    private PropertyType propertyType;

    @NotNull(message = "Listing status is required")
    private SaleStatus status;

    @Min(value = 0, message = "Bedrooms cannot be negative")
    @Max(value = 20, message = "Bedrooms value is too high")
    private Integer bedrooms;

    @Min(value = 0, message = "Bathrooms cannot be negative")
    @Max(value = 20, message = "Bathrooms value is too high")
    private Integer bathrooms;

    @NotNull(message = "Area is required")
    @Positive(message = "Area must be positive")
    private Double area;

    @Min(value = 0, message = "Parking cannot be negative")
    @Max(value = 10, message = "Parking value is too high")
    private Integer parking;

    @Min(value = 1800, message = "Year built must be 1800 or later")
    @Max(value = 2028, message = "Year built is in the future")
    private Integer yearBuilt;

    private OwnershipType ownershipType;

    @Size(max = 500, message = "Street address is too long")
    private String streetAddress;

    @Size(max = 100, message = "Township is too long")
    private String township;

    @Size(max = 100, message = "City is too long")
    private String city;

    @Size(max = 100, message = "State/region is too long")
    private String stateRegion;

    @Size(max = 20, message = "ZIP code is too long")
    private String zipCode;

    private Boolean hasGrant;
    private Boolean hasPermit;

    @DecimalMin(value = "-90.0", message = "Latitude must be between -90 and 90")
    @DecimalMin(value = "90.0", message = "Latitude must be between -90 and 90", inclusive = false)
    @DecimalMin(value = "-180.0", message = "Longitude must be between -180 and 180")
    @DecimalMin(value = "180.0", message = "Longitude must be between -180 and 180", inclusive = false)
    private Double latitude;

    @DecimalMin(value = "-180.0", message = "Longitude must be between -180 and 180")
    @DecimalMin(value = "180.0", message = "Longitude must be between -180 and 180", inclusive = false)
    private Double longitude;

    private Set<String> features;
    private String imageUrl;
    private String nrcDocumentToken;
    private String ownershipDocumentToken;
}
