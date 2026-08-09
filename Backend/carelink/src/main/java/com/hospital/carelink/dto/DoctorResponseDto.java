package com.hospital.carelink.dto;

import java.time.LocalDateTime;

public record DoctorResponseDto(
        Long id,
        String firstName,
        String lastName,
        String email,
        String phone,
        String specialty,
        String gender,
        Integer experienceYears,
        String qualification,
        String department,
        String status,
        LocalDateTime createdAt
) {}
