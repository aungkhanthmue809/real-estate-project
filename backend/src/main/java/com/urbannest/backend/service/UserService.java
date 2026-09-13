package com.urbannest.backend.service;

import com.urbannest.backend.dto.ChangePasswordRequest;
import com.urbannest.backend.dto.UpdateProfileRequest;
import com.urbannest.backend.entity.User;
import com.urbannest.backend.repository.UserRepository;
import com.urbannest.backend.security.CustomUserDetails;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class UserService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    private User getCurrentUser() {
        CustomUserDetails userDetails = (CustomUserDetails) SecurityContextHolder.getContext()
                .getAuthentication().getPrincipal();
        return userRepository.findByUsername(userDetails.getUsername())
                .orElseThrow(() -> new RuntimeException("User not found"));
    }

    public User updateProfile(UpdateProfileRequest request) {
        User user = getCurrentUser();
        if (request.getEmail() != null) user.setEmail(request.getEmail());
        if (request.getPhone() != null) user.setPhone(request.getPhone());
        if (request.getAvatar() != null) user.setAvatar(request.getAvatar());
        return userRepository.save(user);
    }

    public String changePassword(ChangePasswordRequest request) {
        User user = getCurrentUser();
        if (!passwordEncoder.matches(request.getCurrentPassword(), user.getPassword())) {
            throw new RuntimeException("Current password is incorrect");
        }
        user.setPassword(passwordEncoder.encode(request.getNewPassword()));
        userRepository.save(user);
        return "Password changed successfully";
    }

    public List<User> getAllUsers() {
        return userRepository.findAll();
    }

    public User updateUserRole(Long id, String role) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("User not found"));
        user.setRole(com.urbannest.backend.entity.UserRole.valueOf(role));
        return userRepository.save(user);
    }

    public String deleteUser(Long id) {
        if (!userRepository.existsById(id)) {
            throw new RuntimeException("User not found");
        }
        userRepository.deleteById(id);
        return "User deleted successfully";
    }
}
