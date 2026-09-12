package com.urbannest.backend.controller;

import com.urbannest.backend.service.VerificationDocumentStorageService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.server.ResponseStatusException;

import java.util.Map;

@RestController
@RequestMapping("/api/uploads/verification")
@RequiredArgsConstructor
public class VerificationUploadController {

    private final VerificationDocumentStorageService verificationDocumentStorageService;

    @PostMapping(value = "/nrc", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<Map<String, String>> uploadNrc(@RequestParam("file") MultipartFile file) {
        Long userId = getCurrentUserId();
        String token = verificationDocumentStorageService.storeNrc(userId, file);
        return ResponseEntity.ok(Map.of("token", token));
    }

    @PostMapping(value = "/ownership", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<Map<String, String>> uploadOwnership(@RequestParam("file") MultipartFile file) {
        Long userId = getCurrentUserId();
        String token = verificationDocumentStorageService.storeOwnership(userId, file);
        return ResponseEntity.ok(Map.of("token", token));
    }

    private Long getCurrentUserId() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null || !authentication.isAuthenticated()
                || !(authentication.getPrincipal() instanceof com.urbannest.backend.security.CustomUserDetails userDetails)) {
            throw new ResponseStatusException(org.springframework.http.HttpStatus.UNAUTHORIZED, "Authentication required");
        }
        return userDetails.getId();
    }

    @ExceptionHandler(ResponseStatusException.class)
    public ResponseEntity<Map<String, String>> handleUploadError(ResponseStatusException exception) {
        String message = exception.getReason() == null
                ? "Document upload failed. Please try again."
                : exception.getReason();
        return ResponseEntity.status(exception.getStatusCode()).body(Map.of("message", message));
    }
}