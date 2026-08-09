package com.urbannest.backend.service;

import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.urbannest.backend.dto.ChangePasswordRequest;
import com.urbannest.backend.dto.MessageResponse;
import com.urbannest.backend.dto.UpdateProfileRequest;
import com.urbannest.backend.dto.UpdateRoleRequest;
import com.urbannest.backend.dto.UserResponse;
import com.urbannest.backend.exception.ApiException;
import com.urbannest.backend.model.Role;
import com.urbannest.backend.model.User;
import com.urbannest.backend.repository.FavoriteRepository;
import com.urbannest.backend.repository.PropertyRepository;
import com.urbannest.backend.repository.UserRepository;

@Service
public class UserService {

	private final UserRepository userRepository;
	private final PropertyRepository propertyRepository;
	private final FavoriteRepository favoriteRepository;
	private final PasswordEncoder passwordEncoder;
	private final AuthService authService;

	public UserService(UserRepository userRepository,
			PropertyRepository propertyRepository,
			FavoriteRepository favoriteRepository,
			PasswordEncoder passwordEncoder,
			AuthService authService) {
		this.userRepository = userRepository;
		this.propertyRepository = propertyRepository;
		this.favoriteRepository = favoriteRepository;
		this.passwordEncoder = passwordEncoder;
		this.authService = authService;
	}

	@Transactional
	public UserResponse updateProfile(User current, UpdateProfileRequest request) {
		if (request.email() != null && !request.email().isBlank()) {
			userRepository.findByEmail(request.email())
					.filter(other -> !other.getId().equals(current.getId()))
					.ifPresent(other -> { throw new ApiException(HttpStatus.BAD_REQUEST, "Email already registered"); });
			current.setEmail(request.email());
		}
		if (request.phone() != null) {
			current.setPhone(request.phone());
		}
		userRepository.save(current);
		return authService.toUserResponse(current);
	}

	@Transactional
	public MessageResponse changePassword(User current, ChangePasswordRequest request) {
		if (!passwordEncoder.matches(request.currentPassword(), current.getPassword())) {
			throw new ApiException(HttpStatus.BAD_REQUEST, "Current password is incorrect");
		}
		current.setPassword(passwordEncoder.encode(request.newPassword()));
		userRepository.save(current);
		return new MessageResponse("Password changed successfully");
	}

	@Transactional(readOnly = true)
	public List<UserResponse> getAll() {
		return userRepository.findAll().stream().map(authService::toUserResponse).toList();
	}

	@Transactional
	public UserResponse updateRole(Long id, UpdateRoleRequest request) {
		Role role;
		try {
			role = Role.valueOf(request.role().toUpperCase());
		} catch (IllegalArgumentException e) {
			throw new ApiException(HttpStatus.BAD_REQUEST, "Invalid role");
		}
		User user = userRepository.findById(id)
				.orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "User not found"));
		user.setRole(role);
		userRepository.save(user);
		return authService.toUserResponse(user);
	}

	@Transactional
	public MessageResponse delete(Long id) {
		User user = userRepository.findById(id)
				.orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "User not found"));
		var owned = propertyRepository.findByOwner_IdOrderByCreatedAtDesc(user.getId());
		for (var property : owned) {
			favoriteRepository.deleteByPropertyId(property.getId());
		}
		favoriteRepository.deleteByUserId(user.getId());
		propertyRepository.deleteAll(owned);
		userRepository.delete(user);
		return new MessageResponse("User deleted");
	}
}
