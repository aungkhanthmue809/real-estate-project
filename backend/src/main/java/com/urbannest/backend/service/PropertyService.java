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
                .imageUrl(p.getImageUrl())
                .owner(p.getOwner().getUsername())
                .ownerPhone(p.getOwner().getPhone())
                .createdAt(p.getCreatedAt())
                .build();
    }
}
