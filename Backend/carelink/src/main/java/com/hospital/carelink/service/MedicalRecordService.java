package com.hospital.carelink.service;

import com.hospital.carelink.dto.MedicalRecordRequestDto;
import com.hospital.carelink.dto.MedicalRecordResponseDto;
import com.hospital.carelink.model.Doctor;
import com.hospital.carelink.model.MedicalRecord;
import com.hospital.carelink.model.Patient;
import com.hospital.carelink.repository.DoctorRepository;
import com.hospital.carelink.repository.MedicalRecordRepository;
import com.hospital.carelink.repository.PatientRepository;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;
import org.springframework.web.multipart.MultipartFile;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
public class MedicalRecordService {

    private final MedicalRecordRepository recordRepository;
    private final PatientRepository patientRepository;
    private final DoctorRepository doctorRepository;

    @Value("${app.upload-dir:uploads}")
    private String uploadDir;

    public MedicalRecordService(MedicalRecordRepository recordRepository,
                                 PatientRepository patientRepository,
                                 DoctorRepository doctorRepository) {
        this.recordRepository  = recordRepository;
        this.patientRepository = patientRepository;
        this.doctorRepository  = doctorRepository;
    }

    public MedicalRecordResponseDto createRecord(MedicalRecordRequestDto dto, MultipartFile file) throws IOException {
        Patient patient = patientRepository.findById(dto.patientId())
                .orElseThrow(() -> new RuntimeException("Patient not found with ID: " + dto.patientId()));

        Doctor doctor = null;
        if (dto.doctorId() != null) {
            doctor = doctorRepository.findById(dto.doctorId()).orElse(null);
        }

        MedicalRecord record = new MedicalRecord();
        record.setPatient(patient);
        record.setDoctor(doctor);
        record.setDiagnosis(dto.diagnosis());
        record.setPrescription(dto.prescription());
        record.setNotes(dto.notes());
        record.setRecordDate(dto.recordDate());

        if (file != null && !file.isEmpty()) {
            String storedUrl = storeFile(file);
            record.setFileUrl(storedUrl);
            record.setFileName(StringUtils.cleanPath(file.getOriginalFilename()));
            record.setFileType(file.getContentType());
        }

        return mapToDto(recordRepository.save(record));
    }

    public List<MedicalRecordResponseDto> getAllRecords() {
        return recordRepository.findAllByOrderByRecordDateDescCreatedAtDesc()
                .stream().map(this::mapToDto).collect(Collectors.toList());
    }

    public List<MedicalRecordResponseDto> getRecordsByPatient(Long patientId) {
        return recordRepository.findByPatientIdOrderByRecordDateDesc(patientId)
                .stream().map(this::mapToDto).collect(Collectors.toList());
    }

    public MedicalRecordResponseDto updateRecord(Long id, MedicalRecordRequestDto dto, MultipartFile file) throws IOException {
        MedicalRecord record = recordRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Medical record not found with ID: " + id));

        Patient patient = patientRepository.findById(dto.patientId())
                .orElseThrow(() -> new RuntimeException("Patient not found with ID: " + dto.patientId()));

        Doctor doctor = null;
        if (dto.doctorId() != null) {
            doctor = doctorRepository.findById(dto.doctorId()).orElse(null);
        }

        record.setPatient(patient);
        record.setDoctor(doctor);
        record.setDiagnosis(dto.diagnosis());
        record.setPrescription(dto.prescription());
        record.setNotes(dto.notes());
        record.setRecordDate(dto.recordDate());

        if (file != null && !file.isEmpty()) {
            String storedUrl = storeFile(file);
            record.setFileUrl(storedUrl);
            record.setFileName(StringUtils.cleanPath(file.getOriginalFilename()));
            record.setFileType(file.getContentType());
        }

        return mapToDto(recordRepository.save(record));
    }

    public void deleteRecord(Long id) {
        if (!recordRepository.existsById(id)) {
            throw new RuntimeException("Medical record not found with ID: " + id);
        }
        recordRepository.deleteById(id);
    }

    private String storeFile(MultipartFile file) throws IOException {
        Path uploadPath = Paths.get(uploadDir).toAbsolutePath().normalize();
        Files.createDirectories(uploadPath);
        String ext = "";
        String originalName = StringUtils.cleanPath(file.getOriginalFilename());
        int dotIdx = originalName.lastIndexOf('.');
        if (dotIdx >= 0) {
            ext = originalName.substring(dotIdx);
        }
        String fileName = UUID.randomUUID().toString() + ext;
        Path targetLocation = uploadPath.resolve(fileName);
        Files.copy(file.getInputStream(), targetLocation, StandardCopyOption.REPLACE_EXISTING);
        return "/uploads/" + fileName;
    }

    private MedicalRecordResponseDto mapToDto(MedicalRecord r) {
        Patient p = r.getPatient();
        Doctor  d = r.getDoctor();
        return new MedicalRecordResponseDto(
                r.getId(),
                p.getId(), p.getFirstName(), p.getLastName(),
                d != null ? d.getId() : null,
                d != null ? d.getFirstName() : null,
                d != null ? d.getLastName() : null,
                r.getDiagnosis(), r.getPrescription(), r.getNotes(),
                r.getFileUrl(), r.getFileName(), r.getFileType(),
                r.getRecordDate(), r.getCreatedAt()
        );
    }
}
