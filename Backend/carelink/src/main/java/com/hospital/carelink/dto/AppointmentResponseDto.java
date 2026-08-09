package com.hospital.carelink.dto;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;

public record AppointmentResponseDto(
        Long id,
        Long patientId,
        String patientFirstName,
        String patientLastName,
        Long doctorId,
        String doctorFirstName,
        String doctorLastName,
        String doctorSpecialty,
        LocalDate appointmentDate,
        LocalTime timeSlot,
        String status,
        String type,
        String notes,
        LocalDateTime createdAt
) {}
