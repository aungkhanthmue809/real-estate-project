package com.urbannest.backend.controller;

import com.urbannest.backend.dto.ChangePasswordRequest;
import com.urbannest.backend.dto.UpdateProfileRequest;
import com.urbannest.backend.entity.User;
import com.urbannest.backend.service.UserService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/users")
@RequiredArgsConstructor
public class UserController {

    private final UserService userService;

    @PutMapping("/me")
    public ResponseEntity<User> updateProfile(@Valid @RequestBody UpdateProfileRequest request) {
        return ResponseEntity.ok(userService.updateProfile(request));
    }

    @PutMapping("/me/password")
    public ResponseEntity<Map<String, String>> changePassword(@Valid @RequestBody ChangePasswordRequest request) {
        String message = userService.changePassword(request);
        return ResponseEntity.ok(Map.of("message", message));
    }

    @GetMapping
    public ResponseEntity<List<User>> getAllUsers() {
        return ResponseEntity.ok(userService.getAllUsers());
    }

    @PutMapping("/{id}")
    public ResponseEntity<User> updateUser(@PathVariable Long id, @RequestBody Map<String, String> body) {
        String role = body.get("role");
        return ResponseEntity.ok(userService.updateUserRole(id, role));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Map<String, String>> deleteUser(@PathVariable Long id) {
        String message = userService.deleteUser(id);
        return ResponseEntity.ok(Map.of("message", message));
    }
}
