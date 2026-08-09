package com.urbannest.backend.controller;

import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.urbannest.backend.dto.MessageResponse;
import com.urbannest.backend.dto.PropertyRequest;
import com.urbannest.backend.dto.PropertyResponse;
import com.urbannest.backend.model.User;
import com.urbannest.backend.service.PropertyService;

import jakarta.validation.Valid;

@RestController
@RequestMapping("/api/properties")
public class PropertyController {

	private final PropertyService propertyService;

	public PropertyController(PropertyService propertyService) {
		this.propertyService = propertyService;
	}

	@GetMapping
	public ResponseEntity<List<PropertyResponse>> search(
			@RequestParam(required = false) String keyword,
			@RequestParam(required = false) String type,
			@RequestParam(required = false) String status,
			@RequestParam(required = false) String location,
			@RequestParam(required = false) Double minPrice,
			@RequestParam(required = false) Double maxPrice,
			@RequestParam(required = false) String sort,
			@RequestParam(required = false) String dir) {
		return ResponseEntity.ok(propertyService.search(keyword, type, status, location, minPrice, maxPrice, sort, dir));
	}

	@GetMapping("/mine")
	public ResponseEntity<List<PropertyResponse>> mine(Authentication authentication) {
		return ResponseEntity.ok(propertyService.getMine(CurrentUser.get(authentication)));
	}

	@PostMapping
	public ResponseEntity<PropertyResponse> create(Authentication authentication,
			@Valid @RequestBody PropertyRequest request) {
		return ResponseEntity.status(HttpStatus.CREATED)
				.body(propertyService.create(CurrentUser.get(authentication), request));
	}

	@GetMapping("/{id}")
	public ResponseEntity<PropertyResponse> getById(@PathVariable Long id, Authentication authentication) {
		if (authentication != null && authentication.getPrincipal() instanceof User user) {
			return ResponseEntity.ok(propertyService.getByIdForOwnerOrAdmin(id, user));
		}
		return ResponseEntity.ok(propertyService.getById(id));
	}

	@PutMapping("/{id}")
	public ResponseEntity<PropertyResponse> update(@PathVariable Long id, Authentication authentication,
			@Valid @RequestBody PropertyRequest request) {
		return ResponseEntity.ok(propertyService.update(id, CurrentUser.get(authentication), request));
	}

	@DeleteMapping("/{id}")
	public ResponseEntity<MessageResponse> delete(@PathVariable Long id, Authentication authentication) {
		return ResponseEntity.ok(propertyService.delete(id, CurrentUser.get(authentication)));
	}
}
