package com.urbannest.backend.service;

import com.urbannest.backend.dto.PropertyRequest;
import com.urbannest.backend.dto.PropertyResponse;
import com.urbannest.backend.entity.*;
import com.urbannest.backend.repository.PropertyRepository;
import com.urbannest.backend.repository.UserRepository;
import com.urbannest.backend.security.CustomUserDetails;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.util.HashSet;
import java.util.List;

@Service
@RequiredArgsConstructor
public class PropertyService {

    private final PropertyRepository propertyRepository;
    private final UserRepository userRepository;

    private User getCurrentUser() {
        CustomUserDetails userDetails = (CustomUserDetails) SecurityContextHolder.getContext()
                .getAuthentication().getPrincipal();
        return userRepository.findByUsername(userDetails.getUsername())
                .orElseThrow(() -> new RuntimeException("User not found"));
    }

    public List<PropertyResponse> searchProperties(String keyword, PropertyType type, SaleStatus status,
                                                    String location, BigDecimal minPrice, BigDecimal maxPrice) {
        return propertyRepository.searchProperties(
                ApprovalStatus.APPROVED, keyword, type, status, location, minPrice, maxPrice
        ).stream().map(this::toResponse).toList();
    }

    public PropertyResponse getPropertyById(Long id) {
        Property property = propertyRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Property not found"));
        return toResponse(property);
    }

    public List<PropertyResponse> getMyProperties() {
        User owner = getCurrentUser();
        return propertyRepository.findByOwner(owner).stream().map(this::toResponse).toList();
    }

    public PropertyResponse createProperty(PropertyRequest request) {
        User owner = getCurrentUser();
        Property property = Property.builder()
                .title(request.getTitle())
                .description(request.getDescription())
                .price(request.getPrice())
                .location(request.getLocation())
                .propertyType(request.getPropertyType())
                .status(request.getStatus())
                .approvalStatus(ApprovalStatus.PENDING)
                .bedrooms(request.getBedrooms())
                .bathrooms(request.getBathrooms())
                .area(request.getArea())
                .parking(request.getParking())
                .yearBuilt(request.getYearBuilt())
                .ownershipType(request.getOwnershipType())
                .streetAddress(request.getStreetAddress())
                .township(request.getTownship())
                .city(request.getCity())
                .stateRegion(request.getStateRegion())
                .zipCode(request.getZipCode())
                .hasGrant(Boolean.TRUE.equals(request.getHasGrant()))
                .hasPermit(Boolean.TRUE.equals(request.getHasPermit()))
                .latitude(request.getLatitude())
                .longitude(request.getLongitude())
                .features(request.getFeatures() == null ? new HashSet<>() : new HashSet<>(request.getFeatures()))
                .imageUrl(request.getImageUrl())
                .owner(owner)
                .build();

        property = propertyRepository.save(property);
        return toResponse(property);
    }

    public PropertyResponse updateProperty(Long id, PropertyRequest request) {
        Property property = propertyRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Property not found"));
        User currentUser = getCurrentUser();

        if (!property.getOwner().getId().equals(currentUser.getId())) {
            throw new RuntimeException("You can only edit your own properties");
        }

        property.setTitle(request.getTitle());
        property.setDescription(request.getDescription());
        property.setPrice(request.getPrice());
        property.setLocation(request.getLocation());
        property.setPropertyType(request.getPropertyType());
        property.setStatus(request.getStatus());
        property.setBedrooms(request.getBedrooms());
        property.setBathrooms(request.getBathrooms());
        property.setArea(request.getArea());
        property.setImageUrl(request.getImageUrl());
        updateOptionalFields(property, request);

        property = propertyRepository.save(property);
        return toResponse(property);
    }

    public String deleteProperty(Long id) {
        Property property = propertyRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Property not found"));
        User currentUser = getCurrentUser();

        if (!property.getOwner().getId().equals(currentUser.getId())) {
            throw new RuntimeException("You can only delete your own properties");
        }

        propertyRepository.deleteById(id);
        return "Property deleted successfully";
    }

    private PropertyResponse toResponse(Property p) {
        return PropertyResponse.builder()
                .id(p.getId())
                .title(p.getTitle())
                .description(p.getDescription())
                .price(p.getPrice())
                .location(p.getLocation())
                .propertyType(p.getPropertyType())
                .status(p.getStatus())
                .approvalStatus(p.getApprovalStatus())
                .bedrooms(p.getBedrooms())
                .bathrooms(p.getBathrooms())
                .area(p.getArea())
                .parking(p.getParking())
                .yearBuilt(p.getYearBuilt())
                .ownershipType(p.getOwnershipType())
                .streetAddress(p.getStreetAddress())
                .township(p.getTownship())
                .city(p.getCity())
                .stateRegion(p.getStateRegion())
                .zipCode(p.getZipCode())
                .hasGrant(p.getHasGrant())
                .hasPermit(p.getHasPermit())
                .latitude(p.getLatitude())
                .longitude(p.getLongitude())
                .features(p.getFeatures())
                .imageUrl(p.getImageUrl())
                .owner(p.getOwner().getUsername())
                .ownerPhone(p.getOwner().getPhone())
                .createdAt(p.getCreatedAt())
                .build();
    }

    private void updateOptionalFields(Property property, PropertyRequest request) {
        if (request.getParking() != null) property.setParking(request.getParking());
        if (request.getYearBuilt() != null) property.setYearBuilt(request.getYearBuilt());
        if (request.getOwnershipType() != null) property.setOwnershipType(request.getOwnershipType());
        if (request.getStreetAddress() != null) property.setStreetAddress(request.getStreetAddress());
        if (request.getTownship() != null) property.setTownship(request.getTownship());
        if (request.getCity() != null) property.setCity(request.getCity());
        if (request.getStateRegion() != null) property.setStateRegion(request.getStateRegion());
        if (request.getZipCode() != null) property.setZipCode(request.getZipCode());
        if (request.getHasGrant() != null) property.setHasGrant(request.getHasGrant());
        if (request.getHasPermit() != null) property.setHasPermit(request.getHasPermit());
        if (request.getLatitude() != null) property.setLatitude(request.getLatitude());
        if (request.getLongitude() != null) property.setLongitude(request.getLongitude());
        if (request.getFeatures() != null) property.setFeatures(new HashSet<>(request.getFeatures()));
    }
}
