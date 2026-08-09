package com.hospital.carelink.dto;

import java.time.LocalDate;
import java.time.LocalDateTime;

public record MedicalRecordResponseDto(
        Long id,
        Long patientId,
        String patientFirstName,
        String patientLastName,
        Long doctorId,
        String doctorFirstName,
        String doctorLastName,
        String diagnosis,
        String prescription,
        String notes,
        String fileUrl,
        String fileName,
        String fileType,
        LocalDate recordDate,
        LocalDateTime createdAt
) {}
