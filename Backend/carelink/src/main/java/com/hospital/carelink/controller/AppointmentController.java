package com.hospital.carelink.controller;

import com.hospital.carelink.dto.AppointmentRequestDto;
import com.hospital.carelink.dto.AppointmentResponseDto;
import com.hospital.carelink.service.AppointmentService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/appointments")
public class AppointmentController {

    private final AppointmentService appointmentService;

    public AppointmentController(AppointmentService appointmentService) {
        this.appointmentService = appointmentService;
    }

    @PostMapping
    public ResponseEntity<AppointmentResponseDto> createAppointment(
            @Valid @RequestBody AppointmentRequestDto dto) {
        return new ResponseEntity<>(appointmentService.createAppointment(dto), HttpStatus.CREATED);
    }

    @GetMapping
    public ResponseEntity<List<AppointmentResponseDto>> getAllAppointments() {
        return ResponseEntity.ok(appointmentService.getAllAppointments());
    }

    @GetMapping("/today")
    public ResponseEntity<List<AppointmentResponseDto>> getTodayAppointments() {
        return ResponseEntity.ok(appointmentService.getTodayAppointments());
    }

    @GetMapping("/calendar")
    public ResponseEntity<List<AppointmentResponseDto>> getCalendarAppointments(
            @RequestParam int year,
            @RequestParam int month) {
        return ResponseEntity.ok(appointmentService.getCalendarAppointments(year, month));
    }

    @PatchMapping("/{id}/status")
    public ResponseEntity<AppointmentResponseDto> updateStatus(
            @PathVariable Long id,
            @RequestBody Map<String, String> body) {
        String status = body.get("status");
        if (status == null || status.isBlank()) {
            throw new RuntimeException("Status field is required.");
        }
        return ResponseEntity.ok(appointmentService.updateStatus(id, status));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteAppointment(@PathVariable Long id) {
        appointmentService.deleteAppointment(id);
        return ResponseEntity.noContent().build();
    }
}
