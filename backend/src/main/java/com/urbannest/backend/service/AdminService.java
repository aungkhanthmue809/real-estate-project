package com.urbannest.backend.service;

import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.urbannest.backend.dto.MessageResponse;
import com.urbannest.backend.dto.PropertyRequest;
import com.urbannest.backend.dto.PropertyResponse;
import com.urbannest.backend.exception.ApiException;
import com.urbannest.backend.model.ApprovalStatus;
import com.urbannest.backend.model.Property;
import com.urbannest.backend.repository.FavoriteRepository;
import com.urbannest.backend.repository.PropertyRepository;

@Service
public class AdminService {

	private final PropertyRepository propertyRepository;
	private final FavoriteRepository favoriteRepository;
	private final PropertyService propertyService;

	public AdminService(PropertyRepository propertyRepository,
			FavoriteRepository favoriteRepository,
			PropertyService propertyService) {
		this.propertyRepository = propertyRepository;
		this.favoriteRepository = favoriteRepository;
		this.propertyService = propertyService;
	}

	@Transactional(readOnly = true)
	public List<PropertyResponse> getAll(String approvalStatus) {
		List<Property> properties;
		if (approvalStatus != null && !approvalStatus.isBlank()) {
			ApprovalStatus status;
			try {
				status = ApprovalStatus.valueOf(approvalStatus.toUpperCase());
			} catch (IllegalArgumentException e) {
				throw new ApiException(HttpStatus.BAD_REQUEST, "Invalid approval status");
			}
			properties = propertyRepository.findByApprovalStatusOrderByCreatedAtDesc(status);
		} else {
			properties = propertyRepository.findAll();
		}
		return properties.stream().map(propertyService::toResponse).toList();
	}

	@Transactional
	public MessageResponse approve(Long id) {
		Property property = find(id);
		property.setApprovalStatus(ApprovalStatus.APPROVED);
		propertyRepository.save(property);
		return new MessageResponse("Property approved");
	}

	@Transactional
	public MessageResponse reject(Long id) {
		Property property = find(id);
		property.setApprovalStatus(ApprovalStatus.REJECTED);
		propertyRepository.save(property);
		return new MessageResponse("Property rejected");
	}

	@Transactional
	public PropertyResponse update(Long id, PropertyRequest request) {
		Property property = find(id);
		property.setTitle(request.title());
		property.setDescription(request.description());
		property.setPrice(request.price());
		property.setLocation(request.location());
		property.setPropertyType(request.propertyType());
		property.setStatus(request.status());
		property.setBedrooms(request.bedrooms());
		property.setBathrooms(request.bathrooms());
		property.setArea(request.area());
		property.setImageUrl(request.imageUrl());
		propertyRepository.save(property);
		return propertyService.toResponse(property);
	}

	@Transactional
	public MessageResponse delete(Long id) {
		Property property = find(id);
		favoriteRepository.deleteByPropertyId(id);
		propertyRepository.delete(property);
		return new MessageResponse("Property deleted");
	}

	private Property find(Long id) {
		return propertyRepository.findById(id)
				.orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "Property not found"));
	}
}
