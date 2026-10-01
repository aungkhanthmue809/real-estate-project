package com.urbannest.backend.controller;

import com.urbannest.backend.entity.User;
import com.urbannest.backend.entity.UserRole;
import com.urbannest.backend.repository.UserRepository;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;
import org.springframework.http.MediaType;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.transaction.annotation.Transactional;
import tools.jackson.databind.ObjectMapper;

import java.util.Map;
import java.util.List;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.user;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc
@Transactional
class AdminUserManagementIntegrationTest {

    private static final String ENDPOINT = "/api/admin/users/admin";

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Autowired
    private ObjectMapper objectMapper;

    @Test
    void adminCanCreateAdminWithHashedPasswordAndLogin() throws Exception {
        String username = unique("managed_admin");
        String password = "SecurePass123";

        mockMvc.perform(post(ENDPOINT)
                        .with(user("existing-admin").roles("ADMIN"))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(request(username, username + "@example.com", "0912345678", password, password)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.username").value(username))
                .andExpect(jsonPath("$.role").value("ADMIN"));

        User saved = userRepository.findByUsername(username).orElseThrow();
        assertEquals(UserRole.ADMIN, saved.getRole());
        assertTrue(passwordEncoder.matches(password, saved.getPassword()));
        assertTrue(!saved.getPassword().equals(password));

        mockMvc.perform(post("/api/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(Map.of(
                                "username", username,
                                "password", password))))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.role").value("ADMIN"));
    }

    @Test
    void nonAdminAndAnonymousCannotCreateAdmin() throws Exception {
        String body = request(unique("blocked_admin"), "blocked@example.com", "0912345678", "SecurePass123", "SecurePass123");

        mockMvc.perform(post(ENDPOINT).contentType(MediaType.APPLICATION_JSON).content(body))
                .andExpect(status().isForbidden());
        mockMvc.perform(post(ENDPOINT)
                        .with(user("ordinary-user").roles("USER"))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(body))
                .andExpect(status().isForbidden());
    }

    @Test
    void duplicateAndInvalidAdminDetailsAreRejected() throws Exception {
        String username = unique("duplicate_admin");
        userRepository.save(User.builder()
                .username(username)
                .email(username + "@example.com")
                .password(passwordEncoder.encode("ExistingPass123"))
                .phone("0911111111")
                .role(UserRole.USER)
                .build());

        mockMvc.perform(post(ENDPOINT)
                        .with(user("existing-admin").roles("ADMIN"))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(request(username, "new@example.com", "0912345678", "SecurePass123", "SecurePass123")))
                .andExpect(status().isConflict());

        mockMvc.perform(post(ENDPOINT)
                        .with(user("existing-admin").roles("ADMIN"))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(request(unique("valid_admin"), username + "@example.com", "0912345678", "SecurePass123", "SecurePass123")))
                .andExpect(status().isConflict());

        for (Map<String, String> invalid : List.of(
                Map.of("username", "bad-user", "email", "invalid", "phone", "123", "password", "short", "confirmPassword", "short"),
                Map.of("username", unique("mismatch"), "email", "valid@example.com", "phone", "0912345678", "password", "SecurePass123", "confirmPassword", "Different123")
        )) {
            mockMvc.perform(post(ENDPOINT)
                            .with(user("existing-admin").roles("ADMIN"))
                            .contentType(MediaType.APPLICATION_JSON)
                            .content(objectMapper.writeValueAsString(invalid)))
                    .andExpect(status().isBadRequest());
        }
    }

    @Test
    void userCanStillBePromotedButAdminCannotBeDemoted() throws Exception {
        User ordinary = userRepository.save(User.builder()
                .username(unique("promotable_user"))
                .email(unique("promotable") + "@example.com")
                .password(passwordEncoder.encode("UserPass123"))
                .phone("0922222222")
                .role(UserRole.USER)
                .build());
        User admin = userRepository.save(User.builder()
                .username(unique("immutable_admin"))
                .email(unique("immutable") + "@example.com")
                .password(passwordEncoder.encode("AdminPass123"))
                .phone("0933333333")
                .role(UserRole.ADMIN)
                .build());

        mockMvc.perform(put("/api/users/" + ordinary.getId())
                        .with(user("existing-admin").roles("ADMIN"))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"role\":\"ADMIN\"}"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.role").value("ADMIN"));

        mockMvc.perform(put("/api/users/" + admin.getId())
                        .with(user("existing-admin").roles("ADMIN"))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"role\":\"USER\"}"))
                .andExpect(status().isConflict());

        assertEquals(UserRole.ADMIN, userRepository.findById(admin.getId()).orElseThrow().getRole());
    }

    private String request(String username, String email, String phone, String password, String confirmPassword) throws Exception {
        return objectMapper.writeValueAsString(Map.of(
                "username", username,
                "email", email,
                "phone", phone,
                "password", password,
                "confirmPassword", confirmPassword));
    }

    private String unique(String prefix) {
        return prefix + "_" + UUID.randomUUID().toString().replace("-", "").substring(0, 10);
    }
}
