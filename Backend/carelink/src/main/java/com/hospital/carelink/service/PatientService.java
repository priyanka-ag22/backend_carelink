package com.hospital.carelink.service;

import com.hospital.carelink.dto.PatientRequestDto;
import com.hospital.carelink.dto.PatientResponseDto;
import java.util.List;

public interface PatientService {
    PatientResponseDto registerPatient(PatientRequestDto requestDto);
    List<PatientResponseDto> getAllPatients();
    List<PatientResponseDto> searchPatients(String query, String gender, String bloodGroup);
    PatientResponseDto updatePatient(Long id, PatientRequestDto requestDto);
    void deletePatient(Long id);
}