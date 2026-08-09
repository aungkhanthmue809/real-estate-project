package com.urbannest.backend.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;

import com.urbannest.backend.model.PropertyType;
import com.urbannest.backend.model.SaleStatus;

public record PropertyRequest(
		@NotBlank(message = "Title is required") String title,
		String description,
		@NotNull(message = "Price is required") @Positive(message = "Price must be positive") Double price,
		@NotBlank(message = "Location is required") String location,
		@NotNull(message = "Property type is required") PropertyType propertyType,
		@NotNull(message = "Status is required") SaleStatus status,
		Integer bedrooms,
		Integer bathrooms,
		Double area,
		String imageUrl) {
}
