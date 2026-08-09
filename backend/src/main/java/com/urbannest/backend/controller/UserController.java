package com.urbannest.backend.controller;

import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.urbannest.backend.dto.ChangePasswordRequest;
import com.urbannest.backend.dto.MessageResponse;
import com.urbannest.backend.dto.UpdateProfileRequest;
import com.urbannest.backend.dto.UpdateRoleRequest;
import com.urbannest.backend.dto.UserResponse;
import com.urbannest.backend.model.User;
import com.urbannest.backend.service.UserService;

import jakarta.validation.Valid;

@RestController
@RequestMapping("/api/users")
public class UserController {

	private final UserService userService;

	public UserController(UserService userService) {
		this.userService = userService;
	}

	@PutMapping("/me")
	public ResponseEntity<UserResponse> updateProfile(Authentication authentication,
			@Valid @RequestBody UpdateProfileRequest request) {
		return ResponseEntity.ok(userService.updateProfile(CurrentUser.get(authentication), request));
	}

	@PutMapping("/me/password")
	public ResponseEntity<MessageResponse> changePassword(Authentication authentication,
			@Valid @RequestBody ChangePasswordRequest request) {
		return ResponseEntity.ok(userService.changePassword(CurrentUser.get(authentication), request));
	}

	@PreAuthorize("hasRole('ADMIN')")
	@GetMapping
	public ResponseEntity<List<UserResponse>> getAll() {
		return ResponseEntity.ok(userService.getAll());
	}

	@PreAuthorize("hasRole('ADMIN')")
	@PutMapping("/{id}")
	public ResponseEntity<UserResponse> updateRole(@PathVariable Long id,
			@Valid @RequestBody UpdateRoleRequest request) {
		return ResponseEntity.ok(userService.updateRole(id, request));
	}

	@PreAuthorize("hasRole('ADMIN')")
	@DeleteMapping("/{id}")
	public ResponseEntity<MessageResponse> delete(@PathVariable Long id) {
		return ResponseEntity.ok(userService.delete(id));
	}
}
