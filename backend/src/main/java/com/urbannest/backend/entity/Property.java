package com.urbannest.backend.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.HashSet;
import java.util.Set;

@Entity
@Table(name = "properties")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Property {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String title;

    @Column(columnDefinition = "TEXT")
    private String description;

    @Column(nullable = false, precision = 12, scale = 2)
    private BigDecimal price;

    @Column(nullable = false)
    private String location;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private PropertyType propertyType;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private SaleStatus status;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private ApprovalStatus approvalStatus = ApprovalStatus.PENDING;

    private Integer bedrooms;
    private Integer bathrooms;
    private Double area;

    @Column(name = "parking")
    private Integer parking;

    @Column(name = "year_built")
    private Integer yearBuilt;

    @Enumerated(EnumType.STRING)
    @Column(name = "ownership_type", length = 50)
    private OwnershipType ownershipType;

    @Column(name = "street_address", length = 500)
    private String streetAddress;

    @Column(name = "township", length = 100)
    private String township;

    @Column(name = "city", length = 100)
    private String city;

    @Column(name = "state_region", length = 100)
    private String stateRegion;

    @Column(name = "zip_code", length = 20)
    private String zipCode;

    @Builder.Default
    @Column(name = "has_grant", nullable = false)
    private Boolean hasGrant = false;

    @Builder.Default
    @Column(name = "has_permit", nullable = false)
    private Boolean hasPermit = false;

    @Column(name = "latitude")
    private Double latitude;

    @Column(name = "longitude")
    private Double longitude;

    @ElementCollection(fetch = FetchType.EAGER)
    @CollectionTable(
            name = "property_features",
            joinColumns = @JoinColumn(name = "property_id")
    )
    @Column(name = "feature", length = 100)
    @Builder.Default
    private Set<String> features = new HashSet<>();

    private String imageUrl;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "owner_id", nullable = false)
    private User owner;

    @Column(name = "nrc_document_path", length = 500)
    private String nrcDocumentPath;

    @Column(name = "ownership_document_path", length = 500)
    private String ownershipDocumentPath;

    @Builder.Default
    @Column(name = "verification_required", nullable = false)
    private Boolean verificationRequired = false;

    @CreationTimestamp
    @Column(updatable = false)
    private Instant createdAt;

    @UpdateTimestamp
    private Instant updatedAt;
}
