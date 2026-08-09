package com.hospital.carelink.dto;

import com.fasterxml.jackson.annotation.JsonFormat;
import jakarta.validation.constraints.*;
import java.time.LocalDate;

public record MedicalRecordRequestDto(
        @NotNull(message = "Patient ID is required")
        Long patientId,

        Long doctorId,

        @NotBlank(message = "Diagnosis is required")
        String diagnosis,

        String prescription,

        String notes,

        @NotNull(message = "Record date is required")
        @JsonFormat(pattern = "yyyy-MM-dd")
        LocalDate recordDate
) {}
