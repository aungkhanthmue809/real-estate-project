package com.urbannest.backend.controller;

import org.junit.jupiter.api.Test;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors;
import org.springframework.transaction.annotation.Transactional;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc
@Transactional
class AdminPropertyUploadHistoryIntegrationTest {

    @Autowired
    private MockMvc mockMvc;

    @Test
    void adminCanReadPagedHistoryAndFilteredSummary() throws Exception {
        mockMvc.perform(get("/api/admin/property-upload-history")
                        .with(SecurityMockMvcRequestPostProcessors.user("admin").roles("ADMIN"))
                        .param("page", "0")
                        .param("size", "20")
                        .param("sort", "POSTING_FEE_ASC"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.content").isArray())
                .andExpect(jsonPath("$.page").value(0))
                .andExpect(jsonPath("$.size").value(20))
                .andExpect(jsonPath("$.totalElements").isNumber())
                .andExpect(jsonPath("$.filteredPostingFeeTotal").isNumber())
                .andExpect(jsonPath("$.filteredFeeRecordedCount").isNumber())
                .andExpect(jsonPath("$.filteredLegacyFeeCount").isNumber());

        mockMvc.perform(get("/api/admin/property-upload-history")
                        .with(SecurityMockMvcRequestPostProcessors.user("admin").roles("ADMIN"))
                        .param("search", "no-match-value")
                        .param("from", "2026-01-01")
                        .param("to", "2026-01-01"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.content").isEmpty())
                .andExpect(jsonPath("$.totalElements").value(0))
                .andExpect(jsonPath("$.filteredPostingFeeTotal").value(0))
                .andExpect(jsonPath("$.filteredFeeRecordedCount").value(0))
                .andExpect(jsonPath("$.filteredLegacyFeeCount").value(0));
    }

    @Test
    void historyIsAdminOnly() throws Exception {
        mockMvc.perform(get("/api/admin/property-upload-history")
                        .with(SecurityMockMvcRequestPostProcessors.user("normal-user").roles("USER")))
                .andExpect(status().isForbidden());
        mockMvc.perform(get("/api/admin/property-upload-history"))
                .andExpect(status().isForbidden());
    }
}
