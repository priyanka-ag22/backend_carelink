package com.hospital.carelink.controller;

import com.hospital.carelink.dto.PatientRequestDto;
import com.hospital.carelink.dto.PatientResponseDto;
import com.hospital.carelink.service.PatientService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/patients")
public class PatientController {

    private final PatientService patientService;

    public PatientController(PatientService patientService) {
        this.patientService = patientService;
    }

    @PostMapping("/register")
    public ResponseEntity<PatientResponseDto> registerPatient(
            @Valid @RequestBody PatientRequestDto requestDto) {
        return new ResponseEntity<>(patientService.registerPatient(requestDto), HttpStatus.CREATED);
    }

    @GetMapping("/all")
    public ResponseEntity<List<PatientResponseDto>> getAllPatients() {
        return ResponseEntity.ok(patientService.getAllPatients());
    }

    @GetMapping("/search")
    public ResponseEntity<List<PatientResponseDto>> searchPatients(
            @RequestParam(required = false) String q,
            @RequestParam(required = false) String gender,
            @RequestParam(required = false) String bloodGroup) {
        return ResponseEntity.ok(patientService.searchPatients(q, gender, bloodGroup));
    }

    @PutMapping("/{id}")
    public ResponseEntity<PatientResponseDto> updatePatient(
            @PathVariable Long id,
            @Valid @RequestBody PatientRequestDto requestDto) {
        return ResponseEntity.ok(patientService.updatePatient(id, requestDto));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deletePatient(@PathVariable Long id) {
        patientService.deletePatient(id);
        return ResponseEntity.noContent().build();
    }
}