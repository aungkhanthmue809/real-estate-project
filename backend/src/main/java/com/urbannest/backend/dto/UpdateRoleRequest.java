package com.urbannest.backend.dto;

import jakarta.validation.constraints.NotBlank;

public record UpdateRoleRequest(
		@NotBlank(message = "Role is required") String role) {
}
