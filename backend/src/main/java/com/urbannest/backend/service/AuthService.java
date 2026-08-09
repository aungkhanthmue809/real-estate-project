package com.urbannest.backend.service;

import org.springframework.http.HttpStatus;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.urbannest.backend.dto.AuthResponse;
import com.urbannest.backend.dto.LoginRequest;
import com.urbannest.backend.dto.RegisterRequest;
import com.urbannest.backend.dto.UserResponse;
import com.urbannest.backend.exception.ApiException;
import com.urbannest.backend.model.Role;
import com.urbannest.backend.model.User;
import com.urbannest.backend.repository.UserRepository;
import com.urbannest.backend.security.JwtUtil;

@Service
public class AuthService {

	private final UserRepository userRepository;
	private final PasswordEncoder passwordEncoder;
	private final JwtUtil jwtUtil;

	public AuthService(UserRepository userRepository, PasswordEncoder passwordEncoder, JwtUtil jwtUtil) {
		this.userRepository = userRepository;
		this.passwordEncoder = passwordEncoder;
		this.jwtUtil = jwtUtil;
	}

	@Transactional
	public AuthResponse register(RegisterRequest request) {
		if (userRepository.existsByUsername(request.username())) {
			throw new ApiException(HttpStatus.BAD_REQUEST, "Username already taken");
		}
		if (userRepository.existsByEmail(request.email())) {
			throw new ApiException(HttpStatus.BAD_REQUEST, "Email already registered");
		}
		User user = new User();
		user.setUsername(request.username());
		user.setEmail(request.email());
		user.setPassword(passwordEncoder.encode(request.password()));
		user.setPhone(request.phone());
		user.setRole(Role.USER);
		userRepository.save(user);
		return toAuthResponse(user, jwtUtil.generateToken(user));
	}

	@Transactional(readOnly = true)
	public AuthResponse login(LoginRequest request) {
		User user = userRepository.findByUsername(request.username())
				.orElseThrow(() -> new ApiException(HttpStatus.UNAUTHORIZED, "Invalid username or password"));
		if (!passwordEncoder.matches(request.password(), user.getPassword())) {
			throw new ApiException(HttpStatus.UNAUTHORIZED, "Invalid username or password");
		}
		return toAuthResponse(user, jwtUtil.generateToken(user));
	}

	public AuthResponse toAuthResponse(User user, String token) {
		return new AuthResponse(token, user.getId(), user.getUsername(), user.getEmail(), user.getPhone(), user.getRole().name());
	}

	public UserResponse toUserResponse(User user) {
		return new UserResponse(user.getId(), user.getUsername(), user.getEmail(), user.getPhone(), user.getRole().name());
	}
}
