package com.urbannest.backend.service;

import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.urbannest.backend.dto.MessageResponse;
import com.urbannest.backend.dto.PropertyResponse;
import com.urbannest.backend.exception.ApiException;
import com.urbannest.backend.model.Favorite;
import com.urbannest.backend.model.Property;
import com.urbannest.backend.model.User;
import com.urbannest.backend.repository.FavoriteRepository;
import com.urbannest.backend.repository.PropertyRepository;

@Service
public class FavoriteService {

	private final FavoriteRepository favoriteRepository;
	private final PropertyRepository propertyRepository;
	private final PropertyService propertyService;

	public FavoriteService(FavoriteRepository favoriteRepository,
			PropertyRepository propertyRepository,
			PropertyService propertyService) {
		this.favoriteRepository = favoriteRepository;
		this.propertyRepository = propertyRepository;
		this.propertyService = propertyService;
	}

	@Transactional(readOnly = true)
	public List<PropertyResponse> getFavorites(User user) {
		return favoriteRepository.findByUserIdOrderByCreatedAtDesc(user.getId())
				.stream().map(f -> propertyService.toResponse(f.getProperty())).toList();
	}

	@Transactional
	public MessageResponse add(User user, Long propertyId) {
		Property property = propertyRepository.findById(propertyId)
				.orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "Property not found"));
		if (favoriteRepository.existsByUserIdAndPropertyId(user.getId(), propertyId)) {
			return new MessageResponse("Already in favorites");
		}
		Favorite favorite = new Favorite();
		favorite.setUser(user);
		favorite.setProperty(property);
		favoriteRepository.save(favorite);
		return new MessageResponse("Added to favorites");
	}

	@Transactional
	public MessageResponse remove(User user, Long propertyId) {
		Favorite favorite = favoriteRepository.findByUserIdAndPropertyId(user.getId(), propertyId)
				.orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "Not in favorites"));
		favoriteRepository.delete(favorite);
		return new MessageResponse("Removed from favorites");
	}
}
