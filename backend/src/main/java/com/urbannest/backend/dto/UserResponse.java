package com.urbannest.backend.dto;

public record UserResponse(
		Long id,
		String username,
		String email,
		String phone,
		String role) {
}
