package com.urbannest.backend.service;

import java.util.List;

import org.springframework.data.domain.Sort;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.urbannest.backend.dto.MessageResponse;
import com.urbannest.backend.dto.PropertyRequest;
import com.urbannest.backend.dto.PropertyResponse;
import com.urbannest.backend.exception.ApiException;
import com.urbannest.backend.model.ApprovalStatus;
import com.urbannest.backend.model.Property;
import com.urbannest.backend.model.PropertyType;
import com.urbannest.backend.model.SaleStatus;
import com.urbannest.backend.model.User;
import com.urbannest.backend.repository.FavoriteRepository;
import com.urbannest.backend.repository.PropertyRepository;

import jakarta.persistence.criteria.Predicate;

@Service
public class PropertyService {

	private final PropertyRepository propertyRepository;
	private final FavoriteRepository favoriteRepository;

	public PropertyService(PropertyRepository propertyRepository, FavoriteRepository favoriteRepository) {
		this.propertyRepository = propertyRepository;
		this.favoriteRepository = favoriteRepository;
	}

	@Transactional(readOnly = true)
	public List<PropertyResponse> search(String keyword, String type, String status, String location,
			Double minPrice, Double maxPrice, String sort, String dir) {
		Specification<Property> spec = (root, query, cb) -> {
			Predicate predicate = cb.conjunction();
			predicate = cb.and(predicate, cb.equal(root.get("approvalStatus"), ApprovalStatus.APPROVED));
			if (keyword != null && !keyword.isBlank()) {
				String pattern = "%" + keyword.toLowerCase() + "%";
				Predicate title = cb.like(cb.lower(root.get("title")), pattern);
				Predicate loc = cb.like(cb.lower(root.get("location")), pattern);
				predicate = cb.and(predicate, cb.or(title, loc));
			}
			if (type != null && !type.isBlank()) {
				predicate = cb.and(predicate, cb.equal(root.get("propertyType"), PropertyType.valueOf(type)));
			}
			if (status != null && !status.isBlank()) {
				predicate = cb.and(predicate, cb.equal(root.get("status"), SaleStatus.valueOf(status)));
			}
			if (location != null && !location.isBlank()) {
				predicate = cb.and(predicate, cb.like(cb.lower(root.get("location")), "%" + location.toLowerCase() + "%"));
			}
			if (minPrice != null) {
				predicate = cb.and(predicate, cb.greaterThanOrEqualTo(root.get("price"), minPrice));
			}
			if (maxPrice != null) {
				predicate = cb.and(predicate, cb.lessThanOrEqualTo(root.get("price"), maxPrice));
			}
			return predicate;
		};
		return propertyRepository.findAll(spec, resolveSort(sort, dir)).stream().map(this::toResponse).toList();
	}

	private Sort resolveSort(String sort, String dir) {
		String field = switch (sort == null ? "" : sort) {
			case "price" -> "price";
			case "createdAt" -> "createdAt";
			case "title" -> "title";
			default -> "createdAt";
		};
		Sort.Direction direction = "asc".equalsIgnoreCase(dir) ? Sort.Direction.ASC : Sort.Direction.DESC;
		return Sort.by(direction, field);
	}

	@Transactional(readOnly = true)
	public PropertyResponse getById(Long id) {
		Property property = propertyRepository.findById(id)
				.orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "Property not found"));
		if (property.getApprovalStatus() != ApprovalStatus.APPROVED) {
			throw new ApiException(HttpStatus.NOT_FOUND, "Property not found");
		}
		return toResponse(property);
	}

	@Transactional(readOnly = true)
	public PropertyResponse getByIdForOwnerOrAdmin(Long id, User user) {
		Property property = propertyRepository.findById(id)
				.orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "Property not found"));
		if (property.getApprovalStatus() == ApprovalStatus.APPROVED
				|| property.getOwner().getId().equals(user.getId())
				|| user.getRole().name().equals("ADMIN")) {
			return toResponse(property);
		}
		throw new ApiException(HttpStatus.NOT_FOUND, "Property not found");
	}

	@Transactional
	public PropertyResponse create(User owner, PropertyRequest request) {
		Property property = new Property();
		apply(property, request);
		property.setOwner(owner);
		property.setApprovalStatus(ApprovalStatus.PENDING);
		propertyRepository.save(property);
		return toResponse(property);
	}

	@Transactional(readOnly = true)
	public List<PropertyResponse> getMine(User user) {
		return propertyRepository.findByOwner_IdOrderByCreatedAtDesc(user.getId())
				.stream().map(this::toResponse).toList();
	}

	@Transactional
	public PropertyResponse update(Long id, User user, PropertyRequest request) {
		Property property = propertyRepository.findById(id)
				.orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "Property not found"));
		if (!property.getOwner().getId().equals(user.getId())) {
			throw new ApiException(HttpStatus.FORBIDDEN, "You can only edit your own listings");
		}
		apply(property, request);
		property.setApprovalStatus(ApprovalStatus.PENDING);
		propertyRepository.save(property);
		return toResponse(property);
	}

	@Transactional
	public MessageResponse delete(Long id, User user) {
		Property property = propertyRepository.findById(id)
				.orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "Property not found"));
		if (!property.getOwner().getId().equals(user.getId())) {
			throw new ApiException(HttpStatus.FORBIDDEN, "You can only delete your own listings");
		}
		favoriteRepository.deleteByPropertyId(id);
		propertyRepository.delete(property);
		return new MessageResponse("Property deleted");
	}

	private void apply(Property property, PropertyRequest request) {
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
	}

	public PropertyResponse toResponse(Property property) {
		return new PropertyResponse(
				property.getId(),
				property.getTitle(),
				property.getDescription(),
				property.getPrice(),
				property.getLocation(),
				property.getPropertyType().name(),
				property.getStatus().name(),
				property.getBedrooms(),
				property.getBathrooms(),
				property.getArea(),
				property.getImageUrl(),
				property.getApprovalStatus().name(),
				property.getOwner().getUsername(),
				property.getOwner().getPhone(),
				property.getCreatedAt());
	}
}
