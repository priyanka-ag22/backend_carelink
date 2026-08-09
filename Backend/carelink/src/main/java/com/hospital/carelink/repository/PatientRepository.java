package com.hospital.carelink.repository;

import com.hospital.carelink.model.Patient;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface PatientRepository extends JpaRepository<Patient, Long> {

    List<Patient> findAllByOrderByCreatedAtDesc();

    @Query("SELECT p FROM Patient p WHERE " +
           "LOWER(p.firstName) LIKE LOWER(CONCAT('%', :q, '%')) OR " +
           "LOWER(p.lastName) LIKE LOWER(CONCAT('%', :q, '%')) OR " +
           "LOWER(p.email) LIKE LOWER(CONCAT('%', :q, '%')) OR " +
           "CAST(p.id AS string) LIKE CONCAT('%', :q, '%') " +
           "ORDER BY p.createdAt DESC")
    List<Patient> searchByQuery(@Param("q") String query);
}