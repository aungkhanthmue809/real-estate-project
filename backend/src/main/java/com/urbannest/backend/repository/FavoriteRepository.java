package com.urbannest.backend.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

import com.urbannest.backend.model.Favorite;
import com.urbannest.backend.model.Property;
import com.urbannest.backend.model.User;

public interface FavoriteRepository extends JpaRepository<Favorite, Long> {

	List<Favorite> findByUserIdOrderByCreatedAtDesc(Long userId);

	Optional<Favorite> findByUserIdAndPropertyId(Long userId, Long propertyId);

	boolean existsByUserIdAndPropertyId(Long userId, Long propertyId);

	void deleteByPropertyId(Long propertyId);

	void deleteByUserId(Long userId);
}
