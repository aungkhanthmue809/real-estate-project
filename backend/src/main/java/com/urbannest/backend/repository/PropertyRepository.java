package com.urbannest.backend.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;

import com.urbannest.backend.model.ApprovalStatus;
import com.urbannest.backend.model.Property;

public interface PropertyRepository extends JpaRepository<Property, Long>, JpaSpecificationExecutor<Property> {

	List<Property> findByOwner_IdOrderByCreatedAtDesc(Long ownerId);

	List<Property> findByApprovalStatusOrderByCreatedAtDesc(ApprovalStatus status);
}
