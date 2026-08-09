package com.urbannest.backend.controller;

import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.urbannest.backend.dto.MessageResponse;
import com.urbannest.backend.dto.PropertyRequest;
import com.urbannest.backend.dto.PropertyResponse;
import com.urbannest.backend.service.AdminService;

import jakarta.validation.Valid;

@RestController
@RequestMapping("/api/admin/properties")
@PreAuthorize("hasRole('ADMIN')")
public class AdminPropertyController {

	private final AdminService adminService;

	public AdminPropertyController(AdminService adminService) {
		this.adminService = adminService;
	}

	@GetMapping
	public ResponseEntity<List<PropertyResponse>> getAll(
			@RequestParam(required = false) String approvalStatus) {
		return ResponseEntity.ok(adminService.getAll(approvalStatus));
	}

	@PutMapping("/{id}/approve")
	public ResponseEntity<MessageResponse> approve(@PathVariable Long id) {
		return ResponseEntity.ok(adminService.approve(id));
	}

	@PutMapping("/{id}/reject")
	public ResponseEntity<MessageResponse> reject(@PathVariable Long id) {
		return ResponseEntity.ok(adminService.reject(id));
	}

	@PutMapping("/{id}")
	public ResponseEntity<PropertyResponse> update(@PathVariable Long id,
			@Valid @RequestBody PropertyRequest request) {
		return ResponseEntity.ok(adminService.update(id, request));
	}

	@DeleteMapping("/{id}")
	public ResponseEntity<MessageResponse> delete(@PathVariable Long id) {
		return ResponseEntity.ok(adminService.delete(id));
	}
}
