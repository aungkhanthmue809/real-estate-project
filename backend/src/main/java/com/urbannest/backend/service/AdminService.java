package com.urbannest.backend.service;

import com.urbannest.backend.dto.PropertyRequest;
import com.urbannest.backend.dto.PropertyResponse;
import com.urbannest.backend.entity.ApprovalStatus;
import com.urbannest.backend.entity.Property;
import com.urbannest.backend.entity.PropertyType;
import com.urbannest.backend.entity.SaleStatus;
import com.urbannest.backend.entity.NotificationType;
import com.urbannest.backend.repository.PropertyRepository;
import com.urbannest.backend.service.VerificationDocumentStorageService;
import lombok.RequiredArgsConstructor;
import org.springframework.core.io.Resource;
import org.springframework.core.io.UrlResource;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.io.IOException;
import java.math.BigDecimal;
import java.net.MalformedURLException;
import java.nio.file.Path;
import java.util.HashSet;
import java.util.List;

@Service
@RequiredArgsConstructor
public class AdminService {

    private final PropertyRepository propertyRepository;
    private final NotificationService notificationService;
    private final VerificationDocumentStorageService verificationDocumentStorageService;

    public List<PropertyResponse> getAllProperties(ApprovalStatus approvalStatus) {
        List<Property> properties;
        if (approvalStatus != null) {
            properties = propertyRepository.findByApprovalStatus(approvalStatus);
        } else {
            properties = propertyRepository.findAll();
        }
        return properties.stream().map(this::toResponse).toList();
    }

@Transactional
    public String approveProperty(Long id) {
        Property property = propertyRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Property not found"));

        if (Boolean.TRUE.equals(property.getVerificationRequired())) {
            if (property.getNrcDocumentPath() == null || property.getNrcDocumentPath().isBlank()) {
                throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Cannot approve: NRC document is missing");
            }
            if (property.getOwnershipDocumentPath() == null || property.getOwnershipDocumentPath().isBlank()) {
                throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Cannot approve: Ownership document is missing");
            }
        }

        boolean statusChanged = property.getApprovalStatus() != ApprovalStatus.APPROVED;
        property.setApprovalStatus(ApprovalStatus.APPROVED);
        propertyRepository.save(property);
        if (statusChanged) {
            notificationService.createPropertyStatusNotification(property, NotificationType.PROPERTY_APPROVED);
        }
        return "Property approved successfully";
    }

    @Transactional
    public String rejectProperty(Long id) {
        Property property = propertyRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Property not found"));
        boolean statusChanged = property.getApprovalStatus() != ApprovalStatus.REJECTED;
        property.setApprovalStatus(ApprovalStatus.REJECTED);
        propertyRepository.save(property);
        if (statusChanged) {
            notificationService.createPropertyStatusNotification(property, NotificationType.PROPERTY_REJECTED);
        }
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
        updateOptionalFields(property, request);

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
                .hasNrcDocument(p.getNrcDocumentPath() != null)
                .hasOwnershipDocument(p.getOwnershipDocumentPath() != null)
                .verificationRequired(p.getVerificationRequired())
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

    public Resource downloadNrcDocument(Long propertyId) {
        Property property = propertyRepository.findById(propertyId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Property not found"));
        if (property.getNrcDocumentPath() == null || property.getNrcDocumentPath().isBlank()) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "NRC document not found");
        }
        try {
            Path path = verificationDocumentStorageService.resolvePath(property.getNrcDocumentPath());
            Resource resource = new UrlResource(path.toUri());
            if (!resource.exists() || !resource.isReadable()) {
                throw new ResponseStatusException(HttpStatus.NOT_FOUND, "NRC document not found");
            }
            return resource;
        } catch (MalformedURLException exception) {
            throw new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR, "Could not read NRC document", exception);
        }
    }

    public Resource downloadOwnershipDocument(Long propertyId) {
        Property property = propertyRepository.findById(propertyId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Property not found"));
        if (property.getOwnershipDocumentPath() == null || property.getOwnershipDocumentPath().isBlank()) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Ownership document not found");
        }
        try {
            Path path = verificationDocumentStorageService.resolvePath(property.getOwnershipDocumentPath());
            Resource resource = new UrlResource(path.toUri());
            if (!resource.exists() || !resource.isReadable()) {
                throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Ownership document not found");
            }
            return resource;
        } catch (MalformedURLException exception) {
            throw new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR, "Could not read ownership document", exception);
        }
    }
}
