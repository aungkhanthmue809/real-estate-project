package com.urbannest.backend.controller;

import com.urbannest.backend.entity.PropertyPostingFee;
import com.urbannest.backend.entity.PropertyType;
import com.urbannest.backend.entity.SaleStatus;
import com.urbannest.backend.entity.User;
import com.urbannest.backend.entity.UserRole;
import com.urbannest.backend.dto.PropertyRequest;
import com.urbannest.backend.repository.PropertyRepository;
import com.urbannest.backend.repository.PropertyPostingFeeRepository;
import com.urbannest.backend.repository.UserRepository;
import com.urbannest.backend.security.CustomUserDetails;
import com.urbannest.backend.service.PropertyPostingFeeService;
import com.urbannest.backend.service.PropertyService;
import com.urbannest.backend.service.VerificationDocumentStorageService;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.mock.web.MockMultipartFile;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;
import org.springframework.http.MediaType;
import org.springframework.test.annotation.DirtiesContext;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.List;
import java.util.Set;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.user;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc
@Transactional
@DirtiesContext(classMode = DirtiesContext.ClassMode.AFTER_CLASS)
class PropertyPostingFeeIntegrationTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private PropertyPostingFeeRepository repository;

    @Autowired
    private PropertyRepository propertyRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PropertyService propertyService;

    @Autowired
    private PropertyPostingFeeService propertyPostingFeeService;

    @Autowired
    private VerificationDocumentStorageService verificationDocumentStorageService;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @BeforeEach
    void restoreDefaults() {
        repository.saveAll(List.of(
                new PropertyPostingFee(PropertyType.APARTMENT, BigDecimal.valueOf(100_000)),
                new PropertyPostingFee(PropertyType.HOUSE, BigDecimal.valueOf(300_000)),
                new PropertyPostingFee(PropertyType.CONDO, BigDecimal.valueOf(500_000)),
                new PropertyPostingFee(PropertyType.LAND, BigDecimal.valueOf(100_000))
        ));
        repository.flush();
    }

    @AfterEach
    void clearAuthentication() {
        SecurityContextHolder.clearContext();
    }

    @Test
    void migrationProvidesDefaultFees() {
        assertEquals(BigDecimal.valueOf(100_000), repository.findById(PropertyType.APARTMENT).orElseThrow().getFeeAmount());
        assertEquals(BigDecimal.valueOf(300_000), repository.findById(PropertyType.HOUSE).orElseThrow().getFeeAmount());
        assertEquals(BigDecimal.valueOf(500_000), repository.findById(PropertyType.CONDO).orElseThrow().getFeeAmount());
        assertEquals(BigDecimal.valueOf(100_000), repository.findById(PropertyType.LAND).orElseThrow().getFeeAmount());
    }

    @Test
    void publicGetReturnsConfiguredFees() throws Exception {
        mockMvc.perform(get("/api/property-posting-fees"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.length()").value(4))
                .andExpect(jsonPath("$[0].propertyType").value("APARTMENT"))
                .andExpect(jsonPath("$[0].feeAmount").value(100_000))
                .andExpect(jsonPath("$[1].propertyType").value("HOUSE"))
                .andExpect(jsonPath("$[2].propertyType").value("CONDO"))
                .andExpect(jsonPath("$[3].propertyType").value("LAND"));
    }

    @Test
    void userCannotUpdateFee() throws Exception {
        mockMvc.perform(put("/api/admin/property-posting-fees/APARTMENT")
                        .with(user("normal-user").roles("USER"))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"feeAmount\":150000}"))
                .andExpect(status().isForbidden());
    }

    @Test
    void anonymousUserCannotUpdateFee() throws Exception {
        mockMvc.perform(put("/api/admin/property-posting-fees/APARTMENT")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"feeAmount\":150000}"))
                .andExpect(status().isForbidden());
    }

    @Test
    void adminCanUpdateAndPersistFee() throws Exception {
        mockMvc.perform(put("/api/admin/property-posting-fees/APARTMENT")
                        .with(user("admin").roles("ADMIN"))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"feeAmount\":150000}"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.propertyType").value("APARTMENT"))
                .andExpect(jsonPath("$.feeAmount").value(150_000));

        repository.flush();
        assertEquals(BigDecimal.valueOf(150_000), repository.findById(PropertyType.APARTMENT).orElseThrow().getFeeAmount());
    }

    @Test
    void negativeNullAndDecimalFeesAreRejected() throws Exception {
        for (String body : List.of(
                "{\"feeAmount\":-1}",
                "{\"feeAmount\":null}",
                "{\"feeAmount\":100.5}"
        )) {
            mockMvc.perform(put("/api/admin/property-posting-fees/APARTMENT")
                            .with(user("admin").roles("ADMIN"))
                            .contentType(MediaType.APPLICATION_JSON)
                            .content(body))
                    .andExpect(status().isBadRequest());
        }
    }

    @Test
    void invalidAndLegacyOnlyPropertyTypesCannotBeUpdated() throws Exception {
        mockMvc.perform(put("/api/admin/property-posting-fees/NOT_A_TYPE")
                        .with(user("admin").roles("ADMIN"))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"feeAmount\":100000}"))
                .andExpect(status().isBadRequest());

        mockMvc.perform(put("/api/admin/property-posting-fees/TOWNHOUSE")
                        .with(user("admin").roles("ADMIN"))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"feeAmount\":100000}"))
                .andExpect(status().isNotFound());
    }

    @Test
    void newPropertiesCaptureTheCurrentFeeAndEditsDoNotChangeTheSnapshot() {
        User owner = userRepository.save(User.builder()
                .username("fee-snapshot-owner")
                .email("fee-snapshot-owner@example.com")
                .password(passwordEncoder.encode("Password123!"))
                .phone("09123456789")
                .role(UserRole.USER)
                .build());
        SecurityContextHolder.getContext().setAuthentication(
                new UsernamePasswordAuthenticationToken(
                        new CustomUserDetails(owner),
                        owner.getPassword(),
                        new CustomUserDetails(owner).getAuthorities()
                )
        );

        String nrcToken = verificationDocumentStorageService.storeNrc(
                owner.getId(),
                new MockMultipartFile("file", "nrc.jpg", "image/jpeg", new byte[]{(byte) 0xFF, (byte) 0xD8, (byte) 0xFF})
        );
        String ownershipToken = verificationDocumentStorageService.storeOwnership(
                owner.getId(),
                new MockMultipartFile("file", "ownership.jpg", "image/jpeg", new byte[]{(byte) 0xFF, (byte) 0xD8, (byte) 0xFF})
        );

        PropertyRequest firstRequest = propertyRequest("First listing", nrcToken, ownershipToken);
        Long firstId = propertyService.createProperty(firstRequest).getId();
        assertEquals(BigDecimal.valueOf(100_000), propertyRepository.findById(firstId).orElseThrow().getPostingFeeAtSubmission());

        propertyPostingFeeService.update(PropertyType.APARTMENT, BigDecimal.valueOf(150_000));

        PropertyRequest editRequest = propertyRequest("Edited listing", null, null);
        editRequest.setPropertyType(PropertyType.HOUSE);
        editRequest.setStatus(SaleStatus.FOR_RENT);
        propertyService.updateProperty(firstId, editRequest);
        assertEquals(BigDecimal.valueOf(100_000), propertyRepository.findById(firstId).orElseThrow().getPostingFeeAtSubmission());

        String secondNrcToken = verificationDocumentStorageService.storeNrc(
                owner.getId(),
                new MockMultipartFile("file", "nrc-2.jpg", "image/jpeg", new byte[]{(byte) 0xFF, (byte) 0xD8, (byte) 0xFF})
        );
        String secondOwnershipToken = verificationDocumentStorageService.storeOwnership(
                owner.getId(),
                new MockMultipartFile("file", "ownership-2.jpg", "image/jpeg", new byte[]{(byte) 0xFF, (byte) 0xD8, (byte) 0xFF})
        );
        Long secondId = propertyService.createProperty(propertyRequest("Second listing", secondNrcToken, secondOwnershipToken)).getId();
        assertEquals(BigDecimal.valueOf(150_000), propertyRepository.findById(secondId).orElseThrow().getPostingFeeAtSubmission());
    }

    private PropertyRequest propertyRequest(String title, String nrcToken, String ownershipToken) {
        return PropertyRequest.builder()
                .title(title)
                .description("A valid listing description")
                .price(BigDecimal.valueOf(1_000_000))
                .location("Yangon")
                .propertyType(PropertyType.APARTMENT)
                .status(SaleStatus.FOR_SALE)
                .bedrooms(2)
                .bathrooms(1)
                .area(100.0)
                .features(Set.of())
                .nrcDocumentToken(nrcToken)
                .ownershipDocumentToken(ownershipToken)
                .build();
    }
}
