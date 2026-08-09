package com.urbannest.backend.controller;

import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.urbannest.backend.dto.MessageResponse;
import com.urbannest.backend.dto.PropertyResponse;
import com.urbannest.backend.service.FavoriteService;

@RestController
@RequestMapping("/api")
public class FavoriteController {

	private final FavoriteService favoriteService;

	public FavoriteController(FavoriteService favoriteService) {
		this.favoriteService = favoriteService;
	}

	@GetMapping("/favorites")
	public ResponseEntity<List<PropertyResponse>> getFavorites(Authentication authentication) {
		return ResponseEntity.ok(favoriteService.getFavorites(CurrentUser.get(authentication)));
	}

	@PostMapping("/properties/{id}/favorite")
	public ResponseEntity<MessageResponse> add(@PathVariable Long id, Authentication authentication) {
		return ResponseEntity.ok(favoriteService.add(CurrentUser.get(authentication), id));
	}

	@DeleteMapping("/properties/{id}/favorite")
	public ResponseEntity<MessageResponse> remove(@PathVariable Long id, Authentication authentication) {
		return ResponseEntity.ok(favoriteService.remove(CurrentUser.get(authentication), id));
	}
}
