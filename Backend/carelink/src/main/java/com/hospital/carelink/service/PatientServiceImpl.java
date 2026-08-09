package com.hospital.carelink.service;

import com.hospital.carelink.dto.PatientRequestDto;
import com.hospital.carelink.dto.PatientResponseDto;
import com.hospital.carelink.model.Patient;
import com.hospital.carelink.repository.PatientRepository;
import org.springframework.stereotype.Service;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class PatientServiceImpl implements PatientService {

    private final PatientRepository patientRepository;

    public PatientServiceImpl(PatientRepository patientRepository) {
        this.patientRepository = patientRepository;
    }

    @Override
    public PatientResponseDto registerPatient(PatientRequestDto requestDto) {
        Patient patient = new Patient();
        patient.setFirstName(requestDto.firstName());
        patient.setLastName(requestDto.lastName());
        patient.setEmail(requestDto.email());
        patient.setDateOfBirth(requestDto.dateOfBirth());
        patient.setGender(requestDto.gender());
        patient.setBloodGroup(requestDto.bloodGroup());
        patient.setContactNumber(requestDto.contactNumber());
        patient.setEmergencyContact(requestDto.emergencyContact());
        patient.setAddress(requestDto.address());
        Patient savedPatient = patientRepository.save(patient);
        return mapToDto(savedPatient);
    }

    @Override
    public List<PatientResponseDto> getAllPatients() {
        return patientRepository.findAllByOrderByCreatedAtDesc()
                .stream()
                .map(this::mapToDto)
                .collect(Collectors.toList());
    }

    @Override
    public List<PatientResponseDto> searchPatients(String query, String gender, String bloodGroup) {
        List<Patient> results;
        if (query != null && !query.isBlank()) {
            results = patientRepository.searchByQuery(query.trim());
        } else {
            results = patientRepository.findAllByOrderByCreatedAtDesc();
        }
        if (gender != null && !gender.isBlank()) {
            final String genderFilter = gender;
            results = results.stream()
                    .filter(p -> genderFilter.equalsIgnoreCase(p.getGender()))
                    .collect(Collectors.toList());
        }
        if (bloodGroup != null && !bloodGroup.isBlank()) {
            final String bgFilter = bloodGroup;
            results = results.stream()
                    .filter(p -> bgFilter.equalsIgnoreCase(p.getBloodGroup()))
                    .collect(Collectors.toList());
        }
        return results.stream().map(this::mapToDto).collect(Collectors.toList());
    }

    @Override
    public PatientResponseDto updatePatient(Long id, PatientRequestDto requestDto) {
        Patient patient = patientRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Patient not found with ID: " + id));
        patient.setFirstName(requestDto.firstName());
        patient.setLastName(requestDto.lastName());
        patient.setEmail(requestDto.email());
        patient.setDateOfBirth(requestDto.dateOfBirth());
        patient.setGender(requestDto.gender());
        patient.setBloodGroup(requestDto.bloodGroup());
        patient.setContactNumber(requestDto.contactNumber());
        patient.setEmergencyContact(requestDto.emergencyContact());
        patient.setAddress(requestDto.address());
        return mapToDto(patientRepository.save(patient));
    }

    @Override
    public void deletePatient(Long id) {
        if (!patientRepository.existsById(id)) {
            throw new RuntimeException("Patient not found with ID: " + id);
        }
        patientRepository.deleteById(id);
    }

    private PatientResponseDto mapToDto(Patient p) {
        return new PatientResponseDto(
                p.getId(),
                p.getFirstName(),
                p.getLastName(),
                p.getEmail(),
                p.getDateOfBirth(),
                p.getGender(),
                p.getBloodGroup(),
                p.getContactNumber(),
                p.getEmergencyContact(),
                p.getAddress(),
                p.getStatus(),
                p.getCreatedAt()
        );
    }
}