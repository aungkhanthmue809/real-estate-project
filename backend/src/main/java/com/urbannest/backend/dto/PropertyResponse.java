package com.urbannest.backend.dto;

import java.time.Instant;

public record PropertyResponse(
		Long id,
		String title,
		String description,
		Double price,
		String location,
		String propertyType,
		String status,
		Integer bedrooms,
		Integer bathrooms,
		Double area,
		String imageUrl,
		String approvalStatus,
		String owner,
		String ownerPhone,
		Instant createdAt) {
}
