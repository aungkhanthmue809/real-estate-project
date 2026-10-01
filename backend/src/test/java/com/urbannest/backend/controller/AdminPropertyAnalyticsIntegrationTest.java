package com.urbannest.backend.controller;

import com.urbannest.backend.dto.PropertyAnalyticsResponse;
import com.urbannest.backend.entity.ApprovalStatus;
import com.urbannest.backend.entity.Property;
import com.urbannest.backend.entity.PropertyType;
import com.urbannest.backend.entity.SaleStatus;
import com.urbannest.backend.entity.User;
import com.urbannest.backend.entity.UserRole;
import com.urbannest.backend.repository.PropertyRepository;
import com.urbannest.backend.repository.UserRepository;
import com.urbannest.backend.service.PropertyAnalyticsService;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;
import org.springframework.http.MediaType;
import org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc
@Transactional
class AdminPropertyAnalyticsIntegrationTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private PropertyRepository propertyRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PropertyAnalyticsService analyticsService;

    @Test
    void analyticsUsesHistoricalSnapshotsAndCountsLegacyRows() {
        PropertyAnalyticsResponse before = analyticsService.getPropertyAnalytics();
        User owner = userRepository.save(User.builder()
                .username("analytics-owner")
                .email("analytics-owner@example.com")
                .password("hashed")
                .phone("09123456789")
                .role(UserRole.USER)
                .build());

        propertyRepository.save(property(owner, PropertyType.APARTMENT, ApprovalStatus.PENDING, BigDecimal.valueOf(100_000)));
        propertyRepository.save(property(owner, PropertyType.HOUSE, ApprovalStatus.APPROVED, BigDecimal.valueOf(300_000)));
        propertyRepository.save(property(owner, PropertyType.CONDO, ApprovalStatus.REJECTED, null));
        propertyRepository.flush();

        PropertyAnalyticsResponse after = analyticsService.getPropertyAnalytics();
        assertEquals(before.getTotalProperties() + 3, after.getTotalProperties());
        assertEquals(before.getTotalPostingFeeRevenue().add(BigDecimal.valueOf(400_000)), after.getTotalPostingFeeRevenue());
        assertEquals(before.getFeeRecordedListings() + 2, after.getFeeRecordedListings());
        assertEquals(before.getLegacyListingsWithoutFee() + 1, after.getLegacyListingsWithoutFee());
        assertEquals(revenue(before, PropertyType.APARTMENT).add(BigDecimal.valueOf(100_000)), revenue(after, PropertyType.APARTMENT));
        assertEquals(revenue(before, PropertyType.HOUSE).add(BigDecimal.valueOf(300_000)), revenue(after, PropertyType.HOUSE));
    }

    @Test
    void analyticsIsAdminOnly() throws Exception {
        mockMvc.perform(get("/api/admin/analytics/properties")
                        .with(SecurityMockMvcRequestPostProcessors.user("normal-user").roles("USER")))
                .andExpect(status().isForbidden());
        mockMvc.perform(get("/api/admin/analytics/properties"))
                .andExpect(status().isForbidden());
        mockMvc.perform(get("/api/admin/analytics/properties")
                        .with(SecurityMockMvcRequestPostProcessors.user("admin").roles("ADMIN"))
                        .accept(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk());
    }

    private Property property(User owner, PropertyType type, ApprovalStatus approvalStatus, BigDecimal fee) {
        return Property.builder()
                .title("Analytics listing")
                .description("Analytics test listing")
                .price(BigDecimal.valueOf(1_000_000))
                .location("Yangon")
                .propertyType(type)
                .status(SaleStatus.FOR_SALE)
                .approvalStatus(approvalStatus)
                .bedrooms(2)
                .bathrooms(1)
                .area(100.0)
                .postingFeeAtSubmission(fee)
                .owner(owner)
                .build();
    }

    private BigDecimal revenue(PropertyAnalyticsResponse response, PropertyType type) {
        return response.getRevenueByPropertyType().stream()
                .filter(item -> item.getPropertyType() == type)
                .map(PropertyAnalyticsResponse.PropertyTypeRevenue::getRevenue)
                .findFirst()
                .orElse(BigDecimal.ZERO);
    }
}
