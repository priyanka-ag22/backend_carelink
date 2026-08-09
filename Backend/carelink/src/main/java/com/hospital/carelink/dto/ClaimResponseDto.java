package com.hospital.carelink.dto;

import java.math.BigDecimal;

public record ClaimResponseDto(
        Long id,
        Long patientId,
        String diagnosisCode,
        BigDecimal requestedAmount,
        String status
) {}
