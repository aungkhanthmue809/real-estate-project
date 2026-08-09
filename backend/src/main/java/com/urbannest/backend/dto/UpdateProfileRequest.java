package com.urbannest.backend.dto;

import jakarta.validation.constraints.Email;

public record UpdateProfileRequest(
		@Email(message = "Invalid email") String email,
		String phone) {
}
