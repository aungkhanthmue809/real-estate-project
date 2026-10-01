package com.urbannest.backend.service;

import com.urbannest.backend.dto.PropertyRequest;
import com.urbannest.backend.entity.ApprovalStatus;
import com.urbannest.backend.entity.Property;
import com.urbannest.backend.entity.PropertyType;
import com.urbannest.backend.entity.SaleStatus;
import com.urbannest.backend.entity.User;
import com.urbannest.backend.entity.UserRole;
import com.urbannest.backend.repository.PropertyRepository;
import com.urbannest.backend.repository.UserRepository;
import com.urbannest.backend.security.CustomUserDetails;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.server.ResponseStatusException;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.Set;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;

@SpringBootTest
@Transactional
class PropertyApprovalEditProtectionIntegrationTest {

    @Autowired
    private PropertyRepository propertyRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PropertyService propertyService;

    @AfterEach
    void clearAuthentication() {
        SecurityContextHolder.clearContext();
    }

    @Test
    void approvedOwnerCannotChangeMaterialFieldsOrPartiallySave() {
        User owner = createUser("approved-owner");
        Property property = propertyRepository.saveAndFlush(property(owner, ApprovalStatus.APPROVED));
        Instant createdAt = property.getCreatedAt();
        PropertyRequest request = request();
        request.setPrice(BigDecimal.valueOf(800_000_000));
        request.setPropertyType(PropertyType.HOUSE);
        request.setTownship("Bahan");
        request.setFeatures(Set.of("Pool"));

        authenticate(owner);
        ResponseStatusException exception = assertThrows(ResponseStatusException.class,
                () -> propertyService.updateProperty(property.getId(), request));

        assertEquals(409, exception.getStatusCode().value());
        Property unchanged = propertyRepository.findById(property.getId()).orElseThrow();
        assertEquals(BigDecimal.valueOf(200_000_000), unchanged.getPrice());
        assertEquals(PropertyType.APARTMENT, unchanged.getPropertyType());
        assertEquals("Hlaing", unchanged.getTownship());
        assertEquals(ApprovalStatus.APPROVED, unchanged.getApprovalStatus());
        assertEquals(BigDecimal.valueOf(100_000), unchanged.getPostingFeeAtSubmission());
        assertEquals(createdAt, unchanged.getCreatedAt());
    }

    @Test
    void pendingOwnerCanEditWithoutChangingHistoricalFeeOrCreatedAt() {
        User owner = createUser("pending-owner");
        Property property = propertyRepository.saveAndFlush(property(owner, ApprovalStatus.PENDING));
        Instant createdAt = property.getCreatedAt();
        authenticate(owner);

        PropertyRequest request = request();
        request.setTitle("Updated pending title");
        request.setPrice(BigDecimal.valueOf(250_000_000));
        propertyService.updateProperty(property.getId(), request);

        Property updated = propertyRepository.findById(property.getId()).orElseThrow();
        assertEquals("Updated pending title", updated.getTitle());
        assertEquals(BigDecimal.valueOf(250_000_000), updated.getPrice());
        assertEquals(BigDecimal.valueOf(100_000), updated.getPostingFeeAtSubmission());
        assertEquals(createdAt, updated.getCreatedAt());
        assertEquals(ApprovalStatus.PENDING, updated.getApprovalStatus());
    }

    private User createUser(String username) {
        return userRepository.save(User.builder()
                .username(username)
                .email(username + "@example.com")
                .password("hashed")
                .phone("09123456789")
                .role(UserRole.USER)
                .build());
    }

    private void authenticate(User user) {
        CustomUserDetails details = new CustomUserDetails(user);
        SecurityContextHolder.getContext().setAuthentication(
                new UsernamePasswordAuthenticationToken(details, details.getPassword(), details.getAuthorities()));
    }

    private Property property(User owner, ApprovalStatus approvalStatus) {
        return Property.builder()
                .title("Approved apartment")
                .description("A reviewed property")
                .price(BigDecimal.valueOf(200_000_000))
                .location("No. 1 Road, Hlaing")
                .propertyType(PropertyType.APARTMENT)
                .status(SaleStatus.FOR_SALE)
                .approvalStatus(approvalStatus)
                .bedrooms(3)
                .bathrooms(2)
                .area(1200.0)
                .parking(1)
                .yearBuilt(2020)
                .township("Hlaing")
                .city("Yangon")
                .stateRegion("Yangon Region")
                .features(Set.of("Balcony"))
                .imageUrl("/uploads/properties/reviewed.jpg")
                .postingFeeAtSubmission(BigDecimal.valueOf(100_000))
                .owner(owner)
                .build();
    }

    private PropertyRequest request() {
        return PropertyRequest.builder()
                .title("Approved apartment")
                .description("A reviewed property")
                .price(BigDecimal.valueOf(200_000_000))
                .location("No. 1 Road, Hlaing")
                .propertyType(PropertyType.APARTMENT)
                .status(SaleStatus.FOR_SALE)
                .bedrooms(3)
                .bathrooms(2)
                .area(1200.0)
                .parking(1)
                .yearBuilt(2020)
                .township("Hlaing")
                .city("Yangon")
                .stateRegion("Yangon Region")
                .features(Set.of("Balcony"))
                .imageUrl("/uploads/properties/reviewed.jpg")
                .build();
    }
}
