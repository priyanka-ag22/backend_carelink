package com.hospital.carelink.repository;

import com.hospital.carelink.model.Appointment;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import java.time.LocalDate;
import java.util.List;

@Repository
public interface AppointmentRepository extends JpaRepository<Appointment, Long> {

    List<Appointment> findAllByOrderByAppointmentDateDescTimeSlotAsc();

    List<Appointment> findByAppointmentDateOrderByTimeSlotAsc(LocalDate date);

    @Query("SELECT a FROM Appointment a WHERE a.appointmentDate = :date ORDER BY a.timeSlot ASC")
    List<Appointment> findTodayAppointments(@Param("date") LocalDate date);

    @Query("SELECT a FROM Appointment a WHERE YEAR(a.appointmentDate) = :year AND MONTH(a.appointmentDate) = :month ORDER BY a.appointmentDate ASC, a.timeSlot ASC")
    List<Appointment> findByMonthAndYear(@Param("year") int year, @Param("month") int month);
}
