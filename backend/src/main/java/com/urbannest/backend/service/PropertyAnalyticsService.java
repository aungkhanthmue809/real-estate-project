package com.urbannest.backend.service;

import com.urbannest.backend.dto.PropertyAnalyticsResponse;
import com.urbannest.backend.entity.ApprovalStatus;
import com.urbannest.backend.repository.PropertyRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;

@Service
@RequiredArgsConstructor
public class PropertyAnalyticsService {

    private final PropertyRepository propertyRepository;

    @Transactional(readOnly = true)
    public PropertyAnalyticsResponse getPropertyAnalytics() {
        return new PropertyAnalyticsResponse(
                propertyRepository.count(),
                propertyRepository.countByApprovalStatus(ApprovalStatus.PENDING),
                propertyRepository.countByApprovalStatus(ApprovalStatus.APPROVED),
                propertyRepository.countByApprovalStatus(ApprovalStatus.REJECTED),
                valueOrZero(propertyRepository.sumPostingFeeAtSubmission()),
                propertyRepository.countByPostingFeeAtSubmissionIsNotNull(),
                propertyRepository.countByPostingFeeAtSubmissionIsNull(),
                propertyRepository.revenueGroupedByPropertyType().stream()
                        .map(item -> new PropertyAnalyticsResponse.PropertyTypeRevenue(
                                item.getPropertyType(), item.getCount(), valueOrZero(item.getRevenue())))
                        .toList(),
                propertyRepository.countGroupedByPropertyType().stream()
                        .map(item -> new PropertyAnalyticsResponse.PropertyTypeDistribution(item.getPropertyType(), item.getCount()))
                        .toList()
        );
    }

    private BigDecimal valueOrZero(BigDecimal value) {
        return value == null ? BigDecimal.ZERO : value;
    }
}
