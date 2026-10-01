package com.urbannest.backend.service;

import com.urbannest.backend.dto.PropertyPostingFeeResponse;
import com.urbannest.backend.entity.PropertyPostingFee;
import com.urbannest.backend.entity.PropertyType;
import com.urbannest.backend.repository.PropertyPostingFeeRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.EnumSet;
import java.util.List;
import java.util.Set;

@Service
@RequiredArgsConstructor
public class PropertyPostingFeeService {

    private static final Set<PropertyType> CONFIGURABLE_TYPES = EnumSet.of(
            PropertyType.APARTMENT,
            PropertyType.HOUSE,
            PropertyType.CONDO,
            PropertyType.LAND
    );

    private final PropertyPostingFeeRepository repository;

    @Transactional(readOnly = true)
    public List<PropertyPostingFeeResponse> getAll() {
        return repository.findAll().stream()
                .filter(fee -> CONFIGURABLE_TYPES.contains(fee.getPropertyType()))
                .sorted((left, right) -> Integer.compare(
                        left.getPropertyType().ordinal(),
                        right.getPropertyType().ordinal()
                ))
                .map(this::toResponse)
                .toList();
    }

    @Transactional(readOnly = true)
    public BigDecimal getCurrentFee(PropertyType propertyType) {
        if (!CONFIGURABLE_TYPES.contains(propertyType)) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Posting fee not found");
        }
        return repository.findById(propertyType)
                .map(PropertyPostingFee::getFeeAmount)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Posting fee not found"));
    }

    @Transactional
    public PropertyPostingFeeResponse update(PropertyType propertyType, BigDecimal feeAmount) {
        if (!CONFIGURABLE_TYPES.contains(propertyType)) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Posting fee not found");
        }
        if (feeAmount == null || feeAmount.signum() < 0 || feeAmount.stripTrailingZeros().scale() > 0) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Fee amount must be a non-negative whole MMK amount");
        }

        PropertyPostingFee fee = repository.findById(propertyType)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Posting fee not found"));
        fee.setFeeAmount(feeAmount.setScale(0, RoundingMode.UNNECESSARY));
        return toResponse(repository.save(fee));
    }

    private PropertyPostingFeeResponse toResponse(PropertyPostingFee fee) {
        return new PropertyPostingFeeResponse(fee.getPropertyType(), fee.getFeeAmount());
    }
}
