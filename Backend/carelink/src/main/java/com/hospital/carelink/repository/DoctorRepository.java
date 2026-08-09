package com.hospital.carelink.repository;

import com.hospital.carelink.model.Doctor;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface DoctorRepository extends JpaRepository<Doctor, Long> {

    List<Doctor> findAllByOrderByCreatedAtDesc();

    List<Doctor> findBySpecialtyIgnoreCaseOrderByCreatedAtDesc(String specialty);

    @Query("SELECT d FROM Doctor d WHERE " +
           "LOWER(d.firstName) LIKE LOWER(CONCAT('%', :q, '%')) OR " +
           "LOWER(d.lastName) LIKE LOWER(CONCAT('%', :q, '%')) OR " +
           "LOWER(d.specialty) LIKE LOWER(CONCAT('%', :q, '%')) OR " +
           "LOWER(d.department) LIKE LOWER(CONCAT('%', :q, '%')) " +
           "ORDER BY d.createdAt DESC")
    List<Doctor> searchByQuery(@Param("q") String query);
}
