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
