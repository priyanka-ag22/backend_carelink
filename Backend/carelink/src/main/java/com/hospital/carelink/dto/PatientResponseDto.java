package com.hospital.carelink.dto;

import java.time.LocalDate;
import java.time.LocalDateTime;

public record PatientResponseDto(
        Long id,
        String firstName,
        String lastName,
        String email,
        LocalDate dateOfBirth,
        String gender,
        String bloodGroup,
        String contactNumber,
        String emergencyContact,
        String address,
        String status,
        LocalDateTime createdAt
) {}