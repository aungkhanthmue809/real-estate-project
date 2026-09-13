package com.urbannest.backend.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class UpdateProfileRequest {
    @Email(message = "Email must be a valid email address")
    private String email;

    @Pattern(regexp = "^(\\+?[0-9]{8,15})?$", message = "Phone number must contain 8 to 15 digits and may start with +")
    private String phone;

    private String avatar;
}
