package com.hospital.carelink.controller;

import com.hospital.carelink.dto.DoctorRequestDto;
import com.hospital.carelink.dto.DoctorResponseDto;
import com.hospital.carelink.service.DoctorService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/doctors")
public class DoctorController {

    private final DoctorService doctorService;

    public DoctorController(DoctorService doctorService) {
        this.doctorService = doctorService;
    }

    @PostMapping
    public ResponseEntity<DoctorResponseDto> createDoctor(
            @Valid @RequestBody DoctorRequestDto dto) {
        return new ResponseEntity<>(doctorService.createDoctor(dto), HttpStatus.CREATED);
    }

    @GetMapping
    public ResponseEntity<List<DoctorResponseDto>> getAllDoctors() {
        return ResponseEntity.ok(doctorService.getAllDoctors());
    }

    @GetMapping("/search")
    public ResponseEntity<List<DoctorResponseDto>> searchDoctors(
            @RequestParam(required = false) String q,
            @RequestParam(required = false) String specialty,
            @RequestParam(required = false) String gender) {
        return ResponseEntity.ok(doctorService.searchDoctors(q, specialty, gender));
    }

    @PutMapping("/{id}")
    public ResponseEntity<DoctorResponseDto> updateDoctor(
            @PathVariable Long id,
            @Valid @RequestBody DoctorRequestDto dto) {
        return ResponseEntity.ok(doctorService.updateDoctor(id, dto));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteDoctor(@PathVariable Long id) {
        doctorService.deleteDoctor(id);
        return ResponseEntity.noContent().build();
    }
}
