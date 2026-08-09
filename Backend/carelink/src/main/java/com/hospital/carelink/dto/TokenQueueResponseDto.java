package com.hospital.carelink.dto;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;

public record TokenQueueResponseDto(
        Long id,
        Integer tokenNumber,
        String status,
        Long appointmentId,
        Long patientId,
        String patientFirstName,
        String patientLastName,
        Long doctorId,
        String doctorFirstName,
        String doctorLastName,
        String doctorSpecialty,
        LocalDate appointmentDate,
        LocalTime timeSlot,
        String appointmentType,
        LocalDateTime calledAt,
        LocalDateTime createdAt
) {}
