package com.urbannest.backend.dto;

import com.urbannest.backend.entity.UserRole;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AuthResponse {
    private String token;
    private Long id;
    private String username;
    private String email;
    private String phone;
    private UserRole role;
    private String avatar;
}
