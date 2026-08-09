package com.urbannest.backend.dto;

public record AuthResponse(
		String token,
		Long id,
		String username,
		String email,
		String phone,
		String role) {
}
