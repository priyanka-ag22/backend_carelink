package com.hospital.carelink.service;

import com.hospital.carelink.dto.DoctorRequestDto;
import com.hospital.carelink.dto.DoctorResponseDto;
import com.hospital.carelink.model.Doctor;
import com.hospital.carelink.repository.DoctorRepository;
import org.springframework.stereotype.Service;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class DoctorService {

    private final DoctorRepository doctorRepository;

    public DoctorService(DoctorRepository doctorRepository) {
        this.doctorRepository = doctorRepository;
    }

    public DoctorResponseDto createDoctor(DoctorRequestDto dto) {
        Doctor doctor = new Doctor();
        applyFields(doctor, dto);
        return mapToDto(doctorRepository.save(doctor));
    }

    public List<DoctorResponseDto> getAllDoctors() {
        return doctorRepository.findAllByOrderByCreatedAtDesc()
                .stream().map(this::mapToDto).collect(Collectors.toList());
    }

    public List<DoctorResponseDto> searchDoctors(String q, String specialty, String gender) {
        List<Doctor> results;
        if (q != null && !q.isBlank()) {
            results = doctorRepository.searchByQuery(q.trim());
        } else if (specialty != null && !specialty.isBlank()) {
            results = doctorRepository.findBySpecialtyIgnoreCaseOrderByCreatedAtDesc(specialty);
        } else {
            results = doctorRepository.findAllByOrderByCreatedAtDesc();
        }
        if (gender != null && !gender.isBlank()) {
            final String gf = gender;
            results = results.stream()
                    .filter(d -> gf.equalsIgnoreCase(d.getGender()))
                    .collect(Collectors.toList());
        }
        return results.stream().map(this::mapToDto).collect(Collectors.toList());
    }

    public DoctorResponseDto updateDoctor(Long id, DoctorRequestDto dto) {
        Doctor doctor = doctorRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Doctor not found with ID: " + id));
        applyFields(doctor, dto);
        return mapToDto(doctorRepository.save(doctor));
    }

    public void deleteDoctor(Long id) {
        if (!doctorRepository.existsById(id)) {
            throw new RuntimeException("Doctor not found with ID: " + id);
        }
        doctorRepository.deleteById(id);
    }

    private void applyFields(Doctor doctor, DoctorRequestDto dto) {
        doctor.setFirstName(dto.firstName());
        doctor.setLastName(dto.lastName());
        doctor.setEmail(dto.email());
        doctor.setPhone(dto.phone());
        doctor.setSpecialty(dto.specialty());
        doctor.setGender(dto.gender());
        doctor.setExperienceYears(dto.experienceYears());
        doctor.setQualification(dto.qualification());
        doctor.setDepartment(dto.department());
    }

    private DoctorResponseDto mapToDto(Doctor d) {
        return new DoctorResponseDto(
                d.getId(), d.getFirstName(), d.getLastName(), d.getEmail(),
                d.getPhone(), d.getSpecialty(), d.getGender(), d.getExperienceYears(),
                d.getQualification(), d.getDepartment(), d.getStatus(), d.getCreatedAt()
        );
    }
}
