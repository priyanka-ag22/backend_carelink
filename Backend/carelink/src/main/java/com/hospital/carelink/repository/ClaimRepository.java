package com.hospital.carelink.repository;

import com.hospital.carelink.model.Claim;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ClaimRepository extends JpaRepository<Claim, Long> {
    // Automatically fetches all claims based on their status
    List<Claim> findByStatus(String status);
}