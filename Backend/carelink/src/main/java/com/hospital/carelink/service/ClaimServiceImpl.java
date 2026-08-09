package com.hospital.carelink.service;

import com.hospital.carelink.dto.ClaimRequestDto;
import com.hospital.carelink.dto.ClaimResponseDto;
import com.hospital.carelink.model.Claim;
import com.hospital.carelink.model.Patient;
import com.hospital.carelink.repository.ClaimRepository;
import com.hospital.carelink.repository.PatientRepository;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;

/**
 * Service implementation for processing hospital claims.
 * Includes an automated rule-engine for instant approvals.
 * Author: Kshitij Rajput
 */
@Service
public class ClaimServiceImpl implements ClaimService {

    private final ClaimRepository claimRepository;
    private final PatientRepository patientRepository;

    // Constructor Injection for better testability
    public ClaimServiceImpl(ClaimRepository claimRepository, PatientRepository patientRepository) {
        this.claimRepository = claimRepository;
        this.patientRepository = patientRepository;
    }

    @Override
    public ClaimResponseDto submitClaim(ClaimRequestDto request) {
        // Step 1: Verify if the patient exists in our system
        Patient patient = patientRepository.findById(request.patientId())
                .orElseThrow(() -> new RuntimeException("Patient not found with ID: " + request.patientId()));

        // Step 2: Create a new Claim entity from the incoming DTO
        Claim claim = new Claim();
        claim.setPatient(patient);
        claim.setDiagnosisCode(request.diagnosisCode());
        claim.setRequestedAmount(request.requestedAmount());

        // Step 3: Business Logic (Auto-Approval Engine)
        // If the claim amount is <= 10,000 INR, auto-approve it. Otherwise, require manual review.
        BigDecimal autoApproveLimit = new BigDecimal("10000");

        if (request.requestedAmount().compareTo(autoApproveLimit) <= 0) {
            claim.setStatus("APPROVED");
        } else {
            claim.setStatus("PENDING_MANUAL_REVIEW");
        }

        // Step 4: Persist the claim to the database
        Claim savedClaim = claimRepository.save(claim);

        // Step 5: Convert the saved entity back to a Response DTO
        return new ClaimResponseDto(
                savedClaim.getId(),
                patient.getId(),
                savedClaim.getDiagnosisCode(),
                savedClaim.getRequestedAmount(),
                savedClaim.getStatus()
        );
    }
}