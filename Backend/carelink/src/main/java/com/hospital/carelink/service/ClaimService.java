package com.hospital.carelink.service;

import com.hospital.carelink.dto.ClaimRequestDto;
import com.hospital.carelink.dto.ClaimResponseDto;

public interface ClaimService {
    ClaimResponseDto submitClaim(ClaimRequestDto request);
}