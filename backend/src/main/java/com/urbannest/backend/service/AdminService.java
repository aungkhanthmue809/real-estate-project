package com.urbannest.backend.service;

import com.urbannest.backend.dto.PropertyRequest;
import com.urbannest.backend.dto.PropertyResponse;
import com.urbannest.backend.entity.ApprovalStatus;
import com.urbannest.backend.entity.Property;
import com.urbannest.backend.entity.PropertyType;
import com.urbannest.backend.entity.SaleStatus;
import com.urbannest.backend.repository.PropertyRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.util.List;

@Service
@RequiredArgsConstructor
public class AdminService {

    private final PropertyRepository propertyRepository;

    public List<PropertyResponse> getAllProperties(ApprovalStatus approvalStatus) {
        List<Property> properties;
        if (approvalStatus != null) {
            properties = propertyRepository.findByApprovalStatus(approvalStatus);
        } else {
            properties = propertyRepository.findAll();
        }
        return properties.stream().map(this::toResponse).toList();
    }

    public String approveProperty(Long id) {
        Property property = propertyRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Property not found"));
        property.setApprovalStatus(ApprovalStatus.APPROVED);
        propertyRepository.save(property);
        return "Property approved successfully";
    }

    public String rejectProperty(Long id) {
        Property property = propertyRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Property not found"));
        property.setApprovalStatus(ApprovalStatus.REJECTED);
        propertyRepository.save(property);
        return "Property rejected successfully";
    }

    public PropertyResponse updateProperty(Long id, PropertyRequest request) {
        Property property = propertyRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Property not found"));

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
        if (!propertyRepository.existsById(id)) {
            throw new RuntimeException("Property not found");
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
