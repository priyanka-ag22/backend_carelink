package com.hospital.carelink.dto;

import com.fasterxml.jackson.annotation.JsonFormat;
import jakarta.validation.constraints.*;
import java.time.LocalDate;
import java.time.LocalTime;

public record AppointmentRequestDto(
        @NotNull(message = "Patient ID is required")
        Long patientId,

        @NotNull(message = "Doctor ID is required")
        Long doctorId,

        @NotNull(message = "Appointment date is required")
        @FutureOrPresent(message = "Appointment date cannot be in the past")
        @JsonFormat(pattern = "yyyy-MM-dd")
        LocalDate appointmentDate,

        @JsonFormat(pattern = "HH:mm")
        LocalTime timeSlot,

        @NotBlank(message = "Appointment type is required")
        String type,

        String notes
) {}
