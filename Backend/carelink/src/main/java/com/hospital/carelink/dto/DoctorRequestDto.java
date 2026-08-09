package com.hospital.carelink.dto;

import jakarta.validation.constraints.*;

public record DoctorRequestDto(
        @NotBlank(message = "First name is required")
        String firstName,

        @NotBlank(message = "Last name is required")
        String lastName,

        @NotBlank(message = "Email is required")
        @Email(message = "Invalid email format")
        String email,

        @Pattern(regexp = "^[0-9]{10}$", message = "Phone must be exactly 10 digits")
        String phone,

        @NotBlank(message = "Specialty is required")
        String specialty,

        String gender,

        @Min(value = 0, message = "Experience cannot be negative")
        Integer experienceYears,

        String qualification,

        String department
) {}
