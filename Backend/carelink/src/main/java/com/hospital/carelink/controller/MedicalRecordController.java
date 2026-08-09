package com.hospital.carelink.controller;

import com.hospital.carelink.dto.MedicalRecordRequestDto;
import com.hospital.carelink.dto.MedicalRecordResponseDto;
import com.hospital.carelink.service.MedicalRecordService;
import org.springframework.core.io.Resource;
import org.springframework.core.io.UrlResource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import java.io.IOException;
import java.net.MalformedURLException;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.List;

@RestController
@RequestMapping("/api/medical-records")
public class MedicalRecordController {

    private final MedicalRecordService medicalRecordService;

    public MedicalRecordController(MedicalRecordService medicalRecordService) {
        this.medicalRecordService = medicalRecordService;
    }

    @PostMapping(consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<MedicalRecordResponseDto> createRecord(
            @RequestPart("record") MedicalRecordRequestDto dto,
            @RequestPart(value = "file", required = false) MultipartFile file) throws IOException {
        return new ResponseEntity<>(medicalRecordService.createRecord(dto, file), HttpStatus.CREATED);
    }

    @GetMapping
    public ResponseEntity<List<MedicalRecordResponseDto>> getAllRecords(
            @RequestParam(required = false) Long patientId) {
        if (patientId != null) {
            return ResponseEntity.ok(medicalRecordService.getRecordsByPatient(patientId));
        }
        return ResponseEntity.ok(medicalRecordService.getAllRecords());
    }

    @PutMapping(value = "/{id}", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<MedicalRecordResponseDto> updateRecord(
            @PathVariable Long id,
            @RequestPart("record") MedicalRecordRequestDto dto,
            @RequestPart(value = "file", required = false) MultipartFile file) throws IOException {
        return ResponseEntity.ok(medicalRecordService.updateRecord(id, dto, file));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteRecord(@PathVariable Long id) {
        medicalRecordService.deleteRecord(id);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/files/{filename:.+}")
    public ResponseEntity<Resource> serveFile(@PathVariable String filename) {
        try {
            Path filePath = Paths.get("uploads").toAbsolutePath().normalize().resolve(filename);
            Resource resource = new UrlResource(filePath.toUri());
            if (!resource.exists()) {
                return ResponseEntity.notFound().build();
            }
            return ResponseEntity.ok()
                    .header(HttpHeaders.CONTENT_DISPOSITION, "inline; filename=\"" + resource.getFilename() + "\"")
                    .body(resource);
        } catch (MalformedURLException e) {
            return ResponseEntity.badRequest().build();
        }
    }
}
