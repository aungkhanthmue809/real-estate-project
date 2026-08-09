package com.urbannest.backend.controller;

import org.springframework.http.HttpStatus;
import org.springframework.security.core.Authentication;

import com.urbannest.backend.exception.ApiException;
import com.urbannest.backend.model.User;

public final class CurrentUser {

	private CurrentUser() {
	}

	public static User get(Authentication authentication) {
		if (authentication == null || !(authentication.getPrincipal() instanceof User user)) {
			throw new ApiException(HttpStatus.UNAUTHORIZED, "Not logged in");
		}
		return user;
	}
}
