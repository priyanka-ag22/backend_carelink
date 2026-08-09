package com.hospital.carelink.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import java.math.BigDecimal;

public record ClaimRequestDto(
        @NotNull(message = "Patient ID is mandatory")
        Long patientId,

        @NotBlank(message = "Diagnosis code is required")
        String diagnosisCode,

        @NotNull(message = "Amount is required")
        @Positive(message = "Amount should be positive")
        BigDecimal requestedAmount
) {}