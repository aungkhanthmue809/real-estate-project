package com.urbannest.backend.controller;

import com.urbannest.backend.entity.ApprovalStatus;
import com.urbannest.backend.entity.Notification;
import com.urbannest.backend.entity.NotificationType;
import com.urbannest.backend.entity.Property;
import com.urbannest.backend.entity.PropertyType;
import com.urbannest.backend.entity.SaleStatus;
import com.urbannest.backend.entity.User;
import com.urbannest.backend.entity.UserRole;
import com.urbannest.backend.repository.NotificationRepository;
import com.urbannest.backend.repository.ContactMessageRepository;
import com.urbannest.backend.repository.PropertyRepository;
import com.urbannest.backend.repository.UserRepository;
import com.urbannest.backend.security.CustomUserDetails;
import com.urbannest.backend.service.AdminService;
import com.urbannest.backend.service.VerificationDocumentStorageService;
import jakarta.persistence.EntityManager;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;
import org.springframework.http.MediaType;
import org.springframework.mock.web.MockMultipartFile;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.MvcResult;
import org.springframework.transaction.annotation.Transactional;
import tools.jackson.databind.ObjectMapper;

import java.math.BigDecimal;
import java.util.List;
import java.util.Map;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.user;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.multipart;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc
@Transactional
class NotificationIntegrationTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private AdminService adminService;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PropertyRepository propertyRepository;

    @Autowired
    private NotificationRepository notificationRepository;

    @Autowired
    private ContactMessageRepository contactMessageRepository;

    @Autowired
    private EntityManager entityManager;

    @Autowired
    private ObjectMapper objectMapper;

    @Test
    void contactSubmissionNotifiesEachAdminButNotNormalUsers() throws Exception {
        User firstAdmin = createUser("contact-admin-one", UserRole.ADMIN);
        User secondAdmin = createUser("contact-admin-two", UserRole.ADMIN);
        User normalUser = createUser("contact-normal-user");

        mockMvc.perform(post("/api/contact-messages")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(Map.of(
                                "fullName", "Notification Sender",
                                "email", "sender@example.test",
                                "phone", "09 111 222 333",
                                "message", "Please contact me about UrbanNest."
                        ))))
                .andExpect(status().isCreated());

        Notification firstAdminNotification = assertAdminNotification(
                firstAdmin,
                NotificationType.CONTACT_MESSAGE_RECEIVED,
                "New Contact Message",
                "Notification Sender sent a new contact message."
        );
        Notification secondAdminNotification = assertAdminNotification(
                secondAdmin,
                NotificationType.CONTACT_MESSAGE_RECEIVED,
                "New Contact Message",
                "Notification Sender sent a new contact message."
        );
        Long contactMessageId = contactMessageRepository.findAllByOrderByCreatedAtDescIdDesc().getFirst().getId();
        String expectedLink = "/admin/dashboard?focus=contact&messageId=" + contactMessageId;
        assertEquals(expectedLink, firstAdminNotification.getLink());
        assertEquals(expectedLink, secondAdminNotification.getLink());
        assertTrue(notificationRepository.findByUserIdOrderByCreatedAtDescIdDesc(normalUser.getId()).isEmpty());
    }

    @Test
    void newPendingPropertyNotifiesAdminsOnceAndRemainsReadableThroughApi() throws Exception {
        User admin = createUser("property-admin", UserRole.ADMIN);
        User secondAdmin = createUser("property-admin-two", UserRole.ADMIN);
        User owner = createUser("property-owner");
        User unrelatedUser = createUser("property-unrelated");
        String title = "New Pending Notification Home";
        uploadVerificationDocuments(owner);
        String requestBody = propertyRequest(title);

        mockMvc.perform(post("/api/properties")
                        .with(user(new CustomUserDetails(owner)))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(requestBody))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.approvalStatus").value("PENDING"));

        Property property = propertyRepository.findByOwner(owner).getFirst();
        String expectedMessage = owner.getUsername() + " submitted \"" + title + "\" for approval.";
        Notification notification = assertAdminNotification(
                admin,
                NotificationType.PROPERTY_APPROVAL_REQUESTED,
                "New Property Approval Request",
                expectedMessage
        );
        Notification secondAdminNotification = assertAdminNotification(
                secondAdmin,
                NotificationType.PROPERTY_APPROVAL_REQUESTED,
                "New Property Approval Request",
                expectedMessage
        );
        String expectedAdminLink = "/admin/dashboard?focus=property&propertyId=" + property.getId();
        assertEquals(expectedAdminLink, notification.getLink());
        assertEquals(expectedAdminLink, secondAdminNotification.getLink());
        List<Notification> ownerNotifications = notificationRepository
                .findByUserIdOrderByCreatedAtDescIdDesc(owner.getId());
        assertEquals(1, ownerNotifications.size());
        Notification submitted = ownerNotifications.getFirst();
        assertEquals(NotificationType.PROPERTY_SUBMITTED, submitted.getType());
        assertEquals("Property Submitted", submitted.getTitle());
        assertEquals(
                "Your listing \"New Pending Notification Home\" has been submitted for approval.",
                submitted.getMessage()
        );
        assertEquals("/user/my-properties", submitted.getLink());
        assertTrue(notificationRepository.findByUserIdOrderByCreatedAtDescIdDesc(unrelatedUser.getId()).isEmpty());

        mockMvc.perform(get("/api/notifications").with(user(new CustomUserDetails(owner))))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.length()").value(1))
                .andExpect(jsonPath("$[0].type").value("PROPERTY_SUBMITTED"))
                .andExpect(jsonPath("$[0].isRead").value(false));

        mockMvc.perform(put("/api/properties/{id}", property.getId())
                        .with(user(new CustomUserDetails(owner)))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(requestBody))
                .andExpect(status().isOk());

        assertEquals(1, notificationRepository.findByUserIdOrderByCreatedAtDescIdDesc(admin.getId()).size());
        assertEquals(1, notificationRepository.findByUserIdOrderByCreatedAtDescIdDesc(secondAdmin.getId()).size());
        assertEquals(1, notificationRepository.findByUserIdOrderByCreatedAtDescIdDesc(owner.getId()).size());

        mockMvc.perform(get("/api/notifications").with(user(new CustomUserDetails(admin))))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.length()").value(1))
                .andExpect(jsonPath("$[0].type").value("PROPERTY_APPROVAL_REQUESTED"))
                .andExpect(jsonPath("$[0].link").value(expectedAdminLink));

        mockMvc.perform(put("/api/notifications/{id}/read", notification.getId())
                        .with(user(new CustomUserDetails(admin))))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.isRead").value(true));

        adminService.approveProperty(property.getId());
        assertEquals(1, notificationRepository.findByUserIdOrderByCreatedAtDescIdDesc(admin.getId()).size());
        assertEquals(1, notificationRepository.findByUserIdOrderByCreatedAtDescIdDesc(secondAdmin.getId()).size());
        ownerNotifications = notificationRepository.findByUserIdOrderByCreatedAtDescIdDesc(owner.getId());
        assertEquals(2, ownerNotifications.size());
        assertEquals(NotificationType.PROPERTY_APPROVED, ownerNotifications.getFirst().getType());
        assertEquals(NotificationType.PROPERTY_SUBMITTED, ownerNotifications.get(1).getType());
    }

    @Test
    void pendingToApprovedCreatesOwnerNotification() {
        User owner = createUser("approved-owner");
        Property property = createProperty(owner, ApprovalStatus.PENDING, "Approval Test Home");

        adminService.approveProperty(property.getId());

        List<Notification> notifications = notificationRepository.findByUserIdOrderByCreatedAtDescIdDesc(owner.getId());
        assertEquals(1, notifications.size());
        Notification notification = notifications.getFirst();
        assertEquals(NotificationType.PROPERTY_APPROVED, notification.getType());
        assertEquals("Property Approved", notification.getTitle());
        assertEquals("Your listing \"Approval Test Home\" has been approved.", notification.getMessage());
        assertEquals("/property/" + property.getId(), notification.getLink());
        assertFalse(notification.isRead());
    }

    @Test
    void pendingToRejectedCreatesOwnerNotification() {
        User owner = createUser("rejected-owner");
        Property property = createProperty(owner, ApprovalStatus.PENDING, "Rejection Test Home");

        adminService.rejectProperty(property.getId());

        Notification notification = notificationRepository
                .findByUserIdOrderByCreatedAtDescIdDesc(owner.getId()).getFirst();
        assertEquals(NotificationType.PROPERTY_REJECTED, notification.getType());
        assertEquals("Property Rejected", notification.getTitle());
        assertEquals("Your listing \"Rejection Test Home\" was not approved.", notification.getMessage());
        assertEquals("/user/my-properties", notification.getLink());
    }

    @Test
    void repeatedApprovedStatusDoesNotCreateDuplicate() {
        User owner = createUser("repeat-approved");
        Property property = createProperty(owner, ApprovalStatus.PENDING, "Repeat Approval");

        adminService.approveProperty(property.getId());
        adminService.approveProperty(property.getId());

        assertEquals(1, notificationRepository.findByUserIdOrderByCreatedAtDescIdDesc(owner.getId()).size());
    }

    @Test
    void repeatedRejectedStatusDoesNotCreateDuplicate() {
        User owner = createUser("repeat-rejected");
        Property property = createProperty(owner, ApprovalStatus.PENDING, "Repeat Rejection");

        adminService.rejectProperty(property.getId());
        adminService.rejectProperty(property.getId());

        assertEquals(1, notificationRepository.findByUserIdOrderByCreatedAtDescIdDesc(owner.getId()).size());
    }

    @Test
    void notificationBelongsOnlyToPropertyOwner() {
        User owner = createUser("actual-owner");
        User unrelated = createUser("unrelated-user");
        Property property = createProperty(owner, ApprovalStatus.PENDING, "Private Owner Update");

        adminService.approveProperty(property.getId());

        assertEquals(1, notificationRepository.findByUserIdOrderByCreatedAtDescIdDesc(owner.getId()).size());
        assertTrue(notificationRepository.findByUserIdOrderByCreatedAtDescIdDesc(unrelated.getId()).isEmpty());
    }

    @Test
    void notificationListRequiresAuthentication() throws Exception {
        mockMvc.perform(get("/api/notifications"))
                .andExpect(status().isForbidden());
    }

    @Test
    void userReceivesOnlyOwnNotificationsNewestFirst() throws Exception {
        User owner = createUser("list-owner");
        User other = createUser("list-other");
        Property property = createProperty(owner, ApprovalStatus.PENDING, "Ordered Update");
        Property otherProperty = createProperty(other, ApprovalStatus.PENDING, "Other Update");

        adminService.approveProperty(property.getId());
        adminService.rejectProperty(property.getId());
        adminService.approveProperty(otherProperty.getId());

        mockMvc.perform(get("/api/notifications").with(user(new CustomUserDetails(owner))))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.length()").value(2))
                .andExpect(jsonPath("$[0].type").value("PROPERTY_REJECTED"))
                .andExpect(jsonPath("$[1].type").value("PROPERTY_APPROVED"))
                .andExpect(jsonPath("$[0].message").value("Your listing \"Ordered Update\" was not approved."));
    }

    @Test
    void userCanMarkOwnNotificationReadAndStatePersists() throws Exception {
        User owner = createUser("read-owner");
        Property property = createProperty(owner, ApprovalStatus.PENDING, "Read Update");
        adminService.approveProperty(property.getId());
        Long notificationId = notificationRepository
                .findByUserIdOrderByCreatedAtDescIdDesc(owner.getId()).getFirst().getId();

        mockMvc.perform(put("/api/notifications/{id}/read", notificationId)
                        .with(user(new CustomUserDetails(owner))))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.isRead").value(true));

        entityManager.flush();
        entityManager.clear();
        assertTrue(notificationRepository.findById(notificationId).orElseThrow().isRead());
    }

    @Test
    void userCannotMarkAnotherUsersNotificationRead() throws Exception {
        User owner = createUser("protected-owner");
        User other = createUser("id-guesser");
        Property property = createProperty(owner, ApprovalStatus.PENDING, "Protected Update");
        adminService.approveProperty(property.getId());
        Long notificationId = notificationRepository
                .findByUserIdOrderByCreatedAtDescIdDesc(owner.getId()).getFirst().getId();

        mockMvc.perform(put("/api/notifications/{id}/read", notificationId)
                        .with(user(new CustomUserDetails(other))))
                .andExpect(status().isNotFound());

        assertFalse(notificationRepository.findById(notificationId).orElseThrow().isRead());
    }

    @Test
    void markAllReadAffectsOnlyAuthenticatedUser() throws Exception {
        User owner = createUser("mark-all-owner");
        User other = createUser("mark-all-other");
        Property first = createProperty(owner, ApprovalStatus.PENDING, "First Owner Update");
        Property second = createProperty(owner, ApprovalStatus.PENDING, "Second Owner Update");
        Property unrelated = createProperty(other, ApprovalStatus.PENDING, "Unrelated Update");
        adminService.approveProperty(first.getId());
        adminService.rejectProperty(second.getId());
        adminService.approveProperty(unrelated.getId());

        mockMvc.perform(put("/api/notifications/read-all")
                        .with(user(new CustomUserDetails(owner))))
                .andExpect(status().isNoContent());

        entityManager.flush();
        entityManager.clear();
        assertTrue(notificationRepository.findByUserIdOrderByCreatedAtDescIdDesc(owner.getId())
                .stream().allMatch(Notification::isRead));
        assertTrue(notificationRepository.findByUserIdOrderByCreatedAtDescIdDesc(other.getId())
                .stream().noneMatch(Notification::isRead));
    }

    private User createUser(String prefix) {
        return createUser(prefix, UserRole.USER);
    }

    private User createUser(String prefix, UserRole role) {
        String suffix = UUID.randomUUID().toString().replace("-", "");
        return userRepository.save(User.builder()
                .username(prefix + "-" + suffix)
                .email(prefix + "-" + suffix + "@example.test")
                .password("not-used-in-test")
                .phone("09 000 000 000")
                .role(role)
                .build());
    }

    @Autowired
    private VerificationDocumentStorageService verificationDocumentStorageService;

    private String nrcToken;
    private String ownershipToken;

    private void uploadVerificationDocuments(User owner) throws Exception {
        MockMultipartFile nrcFile = new MockMultipartFile(
                "file", "nrc.jpg", "image/jpeg",
                new byte[]{(byte) 0xFF, (byte) 0xD8, (byte) 0xFF, 0x01, 0x02}
        );
        MvcResult nrcResult = mockMvc.perform(multipart("/api/uploads/verification/nrc")
                        .file(nrcFile)
                        .with(user(new CustomUserDetails(owner))))
                .andExpect(status().isOk())
                .andReturn();
        String nrcResponse = nrcResult.getResponse().getContentAsString();
        this.nrcToken = objectMapper.readTree(nrcResponse).get("token").asText();

        MockMultipartFile ownershipFile = new MockMultipartFile(
                "file", "ownership.pdf", "application/pdf",
                "%PDF-1.4 test".getBytes()
        );
        MvcResult ownershipResult = mockMvc.perform(multipart("/api/uploads/verification/ownership")
                        .file(ownershipFile)
                        .with(user(new CustomUserDetails(owner))))
                .andExpect(status().isOk())
                .andReturn();
        String ownershipResponse = ownershipResult.getResponse().getContentAsString();
        this.ownershipToken = objectMapper.readTree(ownershipResponse).get("token").asText();
    }

    private Notification assertAdminNotification(
            User admin,
            NotificationType type,
            String title,
            String message) {
        List<Notification> notifications = notificationRepository
                .findByUserIdOrderByCreatedAtDescIdDesc(admin.getId());
        assertEquals(1, notifications.size());
        Notification notification = notifications.getFirst();
        assertEquals(type, notification.getType());
        assertEquals(title, notification.getTitle());
        assertEquals(message, notification.getMessage());
        assertFalse(notification.isRead());
        return notification;
    }

    private String propertyRequest(String title) throws Exception {
        Map<String, Object> map = new java.util.HashMap<>();
        map.put("title", title);
        map.put("description", "Notification integration test property");
        map.put("price", 100000);
        map.put("location", "Yangon");
        map.put("propertyType", "APARTMENT");
        map.put("status", "FOR_SALE");
        map.put("bedrooms", 2);
        map.put("bathrooms", 1);
        map.put("area", 750);
        map.put("imageUrl", "");
        map.put("nrcDocumentToken", nrcToken);
        map.put("ownershipDocumentToken", ownershipToken);
        return objectMapper.writeValueAsString(map);
    }

    private Property createProperty(User owner, ApprovalStatus approvalStatus, String title) {
        return propertyRepository.save(Property.builder()
                .title(title)
                .description("Notification integration test property")
                .price(BigDecimal.valueOf(100_000))
                .location("Yangon")
                .propertyType(PropertyType.APARTMENT)
                .status(SaleStatus.FOR_SALE)
                .approvalStatus(approvalStatus)
                .bedrooms(2)
                .bathrooms(1)
                .area(750.0)
                .imageUrl("")
                .owner(owner)
                .build());
    }
}
