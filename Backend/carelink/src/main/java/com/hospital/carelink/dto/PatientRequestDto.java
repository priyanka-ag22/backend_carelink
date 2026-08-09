package com.hospital.carelink.dto;

import com.fasterxml.jackson.annotation.JsonFormat;
import jakarta.validation.constraints.*;
import java.time.LocalDate;

public record PatientRequestDto(
        @NotBlank(message = "First name is required")
        @Size(min = 2, message = "First name must be at least 2 characters")
        String firstName,

        @NotBlank(message = "Last name is required")
        @Size(min = 2, message = "Last name must be at least 2 characters")
        String lastName,

        @NotBlank(message = "Email is required")
        @Email(message = "Invalid email format")
        String email,

        @NotNull(message = "Date of birth is required")
        @Past(message = "Date of birth must be a past date")
        @JsonFormat(pattern = "yyyy-MM-dd")
        LocalDate dateOfBirth,

        @NotBlank(message = "Gender is required")
        String gender,

        @NotBlank(message = "Blood group is required")
        String bloodGroup,

        @NotBlank(message = "Contact number is required")
        @Pattern(regexp = "^[0-9]{10}$", message = "Contact number must be exactly 10 digits")
        String contactNumber,

        @NotBlank(message = "Emergency contact is required")
        @Pattern(regexp = "^[0-9]{10}$", message = "Emergency contact must be exactly 10 digits")
        String emergencyContact,

        @NotBlank(message = "Address is required")
        @Size(min = 10, message = "Address must be at least 10 characters")
        String address
) {}