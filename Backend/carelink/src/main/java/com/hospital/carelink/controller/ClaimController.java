package com.hospital.carelink.controller;

import com.hospital.carelink.dto.ClaimRequestDto;
import com.hospital.carelink.dto.ClaimResponseDto;
import com.hospital.carelink.service.ClaimService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

/**
 * REST Controller for managing insurance claims.
 * Upgraded to DTO pattern for enterprise-grade security.
 * Author: Kshitij Rajput
 */
@RestController
@RequestMapping("/api/v1/claims")
@CrossOrigin(origins = "*")
public class ClaimController {

    private final ClaimService claimService;

    // Opted for Constructor Injection instead of @Autowired
    public ClaimController(ClaimService claimService) {
        this.claimService = claimService;
    }

    // Using @Valid to ensure strict data validation via DTOs instead of raw Maps
    @PostMapping
    public ResponseEntity<ClaimResponseDto> submitClaim(@Valid @RequestBody ClaimRequestDto requestDto) {
        ClaimResponseDto response = claimService.submitClaim(requestDto);
        return new ResponseEntity<>(response, HttpStatus.CREATED);
    }
}