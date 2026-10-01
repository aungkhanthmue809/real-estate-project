package com.urbannest.backend.repository;

import com.urbannest.backend.entity.ApprovalStatus;
import com.urbannest.backend.entity.Property;
import com.urbannest.backend.entity.PropertyType;
import com.urbannest.backend.entity.SaleStatus;
import com.urbannest.backend.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.math.BigDecimal;
import java.util.List;
import java.time.Instant;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import com.urbannest.backend.repository.PropertyUploadHistoryAggregateProjection;

public interface PropertyRepository extends JpaRepository<Property, Long> {

    List<Property> findByOwner(User owner);

    List<Property> findByApprovalStatus(ApprovalStatus approvalStatus);

    long countByApprovalStatus(ApprovalStatus approvalStatus);

    long countByPostingFeeAtSubmissionIsNotNull();

    long countByPostingFeeAtSubmissionIsNull();

    @Query("SELECT p.propertyType AS propertyType, COUNT(p) AS count FROM Property p GROUP BY p.propertyType")
    List<PropertyTypeCountProjection> countGroupedByPropertyType();

    @Query("SELECT p.propertyType AS propertyType, COUNT(p) AS count, COALESCE(SUM(p.postingFeeAtSubmission), 0) AS revenue " +
           "FROM Property p WHERE p.postingFeeAtSubmission IS NOT NULL GROUP BY p.propertyType")
    List<PropertyTypeRevenueProjection> revenueGroupedByPropertyType();

    @Query("SELECT COALESCE(SUM(p.postingFeeAtSubmission), 0) FROM Property p WHERE p.postingFeeAtSubmission IS NOT NULL")
    BigDecimal sumPostingFeeAtSubmission();

    @Query(value = "SELECT p FROM Property p JOIN p.owner owner " +
            "WHERE p.createdAt >= :fromDate " +
            "AND p.createdAt < :toDate " +
            "AND (:propertyType IS NULL OR p.propertyType = :propertyType) " +
            "AND (:listingStatus IS NULL OR p.status = :listingStatus) " +
            "AND (:approvalStatus IS NULL OR p.approvalStatus = :approvalStatus) " +
            "AND (CAST(:township AS string) IS NULL OR LOWER(p.township) = LOWER(CAST(:township AS string))) " +
            "AND (CAST(:search AS string) IS NULL OR LOWER(p.title) LIKE LOWER(CONCAT('%', CAST(:search AS string), '%')) " +
            "OR LOWER(owner.username) LIKE LOWER(CONCAT('%', CAST(:search AS string), '%')) " +
            "OR LOWER(owner.email) LIKE LOWER(CONCAT('%', CAST(:search AS string), '%')) " +
            "OR CAST(p.id AS string) LIKE CONCAT('%', CAST(:search AS string), '%')) " +
            "ORDER BY " +
            "CASE WHEN :sort = 'POSTING_FEE_DESC' AND p.postingFeeAtSubmission IS NULL THEN 1 ELSE 0 END ASC, " +
            "CASE WHEN :sort = 'POSTING_FEE_ASC' AND p.postingFeeAtSubmission IS NULL THEN 1 ELSE 0 END ASC, " +
            "CASE WHEN :sort = 'NEWEST' THEN p.createdAt END DESC, " +
            "CASE WHEN :sort = 'OLDEST' THEN p.createdAt END ASC, " +
            "CASE WHEN :sort = 'POSTING_FEE_DESC' THEN p.postingFeeAtSubmission END DESC, " +
            "CASE WHEN :sort = 'POSTING_FEE_ASC' THEN p.postingFeeAtSubmission END ASC, " +
            "CASE WHEN :sort = 'PROPERTY_PRICE_DESC' THEN p.price END DESC, " +
            "CASE WHEN :sort = 'PROPERTY_PRICE_ASC' THEN p.price END ASC, " +
            "p.createdAt DESC, p.id DESC",
            countQuery = "SELECT COUNT(p) FROM Property p JOIN p.owner owner " +
                    "WHERE p.createdAt >= :fromDate " +
                    "AND p.createdAt < :toDate " +
                    "AND (:propertyType IS NULL OR p.propertyType = :propertyType) " +
                    "AND (:listingStatus IS NULL OR p.status = :listingStatus) " +
                    "AND (:approvalStatus IS NULL OR p.approvalStatus = :approvalStatus) " +
                    "AND (CAST(:township AS string) IS NULL OR LOWER(p.township) = LOWER(CAST(:township AS string))) " +
                    "AND (CAST(:search AS string) IS NULL OR LOWER(p.title) LIKE LOWER(CONCAT('%', CAST(:search AS string), '%')) " +
                    "OR LOWER(owner.username) LIKE LOWER(CONCAT('%', CAST(:search AS string), '%')) " +
                    "OR LOWER(owner.email) LIKE LOWER(CONCAT('%', CAST(:search AS string), '%')) " +
                    "OR CAST(p.id AS string) LIKE CONCAT('%', CAST(:search AS string), '%'))")
    Page<Property> searchUploadHistory(
            @Param("fromDate") Instant fromDate,
            @Param("toDate") Instant toDate,
            @Param("propertyType") PropertyType propertyType,
            @Param("listingStatus") SaleStatus listingStatus,
            @Param("approvalStatus") ApprovalStatus approvalStatus,
            @Param("township") String township,
            @Param("search") String search,
            @Param("sort") String sort,
            Pageable pageable
    );

    @Query("SELECT COALESCE(SUM(p.postingFeeAtSubmission), 0) AS totalRevenue, " +
            "COALESCE(SUM(CASE WHEN p.postingFeeAtSubmission IS NOT NULL THEN 1 ELSE 0 END), 0) AS feeRecordedCount, " +
            "COALESCE(SUM(CASE WHEN p.postingFeeAtSubmission IS NULL THEN 1 ELSE 0 END), 0) AS legacyFeeCount " +
            "FROM Property p JOIN p.owner owner " +
            "WHERE p.createdAt >= :fromDate " +
            "AND p.createdAt < :toDate " +
            "AND (:propertyType IS NULL OR p.propertyType = :propertyType) " +
            "AND (:listingStatus IS NULL OR p.status = :listingStatus) " +
            "AND (:approvalStatus IS NULL OR p.approvalStatus = :approvalStatus) " +
            "AND (CAST(:township AS string) IS NULL OR LOWER(p.township) = LOWER(CAST(:township AS string))) " +
            "AND (CAST(:search AS string) IS NULL OR LOWER(p.title) LIKE LOWER(CONCAT('%', CAST(:search AS string), '%')) " +
            "OR LOWER(owner.username) LIKE LOWER(CONCAT('%', CAST(:search AS string), '%')) " +
            "OR LOWER(owner.email) LIKE LOWER(CONCAT('%', CAST(:search AS string), '%')) " +
            "OR CAST(p.id AS string) LIKE CONCAT('%', CAST(:search AS string), '%'))")
    PropertyUploadHistoryAggregateProjection aggregateUploadHistory(
            @Param("fromDate") Instant fromDate,
            @Param("toDate") Instant toDate,
            @Param("propertyType") PropertyType propertyType,
            @Param("listingStatus") SaleStatus listingStatus,
            @Param("approvalStatus") ApprovalStatus approvalStatus,
            @Param("township") String township,
            @Param("search") String search
    );

    @Query("SELECT p FROM Property p WHERE p.approvalStatus = :approvalStatus " +
           "AND (CAST(:keyword AS string) IS NULL OR LOWER(p.title) LIKE LOWER(CONCAT('%', CAST(:keyword AS string), '%')) " +
           "OR LOWER(p.description) LIKE LOWER(CONCAT('%', CAST(:keyword AS string), '%'))) " +
           "AND (:type IS NULL OR p.propertyType = :type) " +
           "AND (:status IS NULL OR p.status = :status) " +
           "AND (CAST(:location AS string) IS NULL OR LOWER(p.location) LIKE LOWER(CONCAT('%', CAST(:location AS string), '%'))) " +
           "AND (:minPrice IS NULL OR p.price >= :minPrice) " +
           "AND (:maxPrice IS NULL OR p.price <= :maxPrice)")
    List<Property> searchProperties(
            @Param("approvalStatus") ApprovalStatus approvalStatus,
            @Param("keyword") String keyword,
            @Param("type") PropertyType type,
            @Param("status") SaleStatus status,
            @Param("location") String location,
            @Param("minPrice") BigDecimal minPrice,
            @Param("maxPrice") BigDecimal maxPrice
    );
}
