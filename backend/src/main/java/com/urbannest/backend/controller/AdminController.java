package com.urbannest.backend.controller;

import com.urbannest.backend.dto.PropertyRequest;
import com.urbannest.backend.dto.PropertyResponse;
import com.urbannest.backend.entity.ApprovalStatus;
import com.urbannest.backend.service.AdminService;
import lombok.RequiredArgsConstructor;
import org.springframework.core.io.Resource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.io.IOException;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/admin/properties")
@RequiredArgsConstructor
public class AdminController {

    private final AdminService adminService;

    @GetMapping
    public ResponseEntity<List<PropertyResponse>> getAllProperties(
            @RequestParam(required = false) ApprovalStatus approvalStatus) {
        return ResponseEntity.ok(adminService.getAllProperties(approvalStatus));
    }

    @PutMapping("/{id}/approve")
    public ResponseEntity<Map<String, String>> approveProperty(@PathVariable Long id) {
        String message = adminService.approveProperty(id);
        return ResponseEntity.ok(Map.of("message", message));
    }

    @PutMapping("/{id}/reject")
    public ResponseEntity<Map<String, String>> rejectProperty(@PathVariable Long id) {
        String message = adminService.rejectProperty(id);
        return ResponseEntity.ok(Map.of("message", message));
    }

    @PutMapping("/{id}")
    public ResponseEntity<PropertyResponse> updateProperty(@PathVariable Long id, @RequestBody PropertyRequest request) {
        return ResponseEntity.ok(adminService.updateProperty(id, request));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Map<String, String>> deleteProperty(@PathVariable Long id) {
        String message = adminService.deleteProperty(id);
        return ResponseEntity.ok(Map.of("message", message));
    }

    @GetMapping("/{id}/verification/nrc")
    public ResponseEntity<Resource> downloadNrc(@PathVariable Long id) throws IOException {
        Resource resource = adminService.downloadNrcDocument(id);
        String filename = "nrc-" + id + getExtension(resource);
        return ResponseEntity.ok()
                .contentType(determineContentType(resource))
                .header(HttpHeaders.CONTENT_DISPOSITION, "inline; filename=\"" + filename + "\"")
                .body(resource);
    }

    @GetMapping("/{id}/verification/ownership")
    public ResponseEntity<Resource> downloadOwnership(@PathVariable Long id) throws IOException {
        Resource resource = adminService.downloadOwnershipDocument(id);
        String filename = "ownership-" + id + getExtension(resource);
        return ResponseEntity.ok()
                .contentType(determineContentType(resource))
                .header(HttpHeaders.CONTENT_DISPOSITION, "inline; filename=\"" + filename + "\"")
                .body(resource);
    }

    private String getExtension(Resource resource) {
        try {
            String originalFilename = resource.getFilename();
            if (originalFilename != null && originalFilename.contains(".")) {
                return originalFilename.substring(originalFilename.lastIndexOf("."));
            }
        } catch (Exception ignored) {
        }
        return "";
    }

    private MediaType determineContentType(Resource resource) {
        try {
            String originalFilename = resource.getFilename();
            if (originalFilename != null) {
                if (originalFilename.toLowerCase().endsWith(".pdf")) {
                    return MediaType.APPLICATION_PDF;
                }
                if (originalFilename.toLowerCase().endsWith(".jpg") || originalFilename.toLowerCase().endsWith(".jpeg")) {
                    return MediaType.IMAGE_JPEG;
                }
                if (originalFilename.toLowerCase().endsWith(".png")) {
                    return MediaType.IMAGE_PNG;
                }
            }
        } catch (Exception ignored) {
        }
        return MediaType.APPLICATION_OCTET_STREAM;
    }
}
