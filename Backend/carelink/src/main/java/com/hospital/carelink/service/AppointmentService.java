package com.hospital.carelink.service;

import com.hospital.carelink.dto.AppointmentRequestDto;
import com.hospital.carelink.dto.AppointmentResponseDto;
import com.hospital.carelink.model.Appointment;
import com.hospital.carelink.model.Doctor;
import com.hospital.carelink.model.Patient;
import com.hospital.carelink.repository.AppointmentRepository;
import com.hospital.carelink.repository.DoctorRepository;
import com.hospital.carelink.repository.PatientRepository;
import org.springframework.stereotype.Service;
import java.time.LocalDate;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class AppointmentService {

    private final AppointmentRepository appointmentRepository;
    private final PatientRepository patientRepository;
    private final DoctorRepository doctorRepository;

    public AppointmentService(AppointmentRepository appointmentRepository,
                              PatientRepository patientRepository,
                              DoctorRepository doctorRepository) {
        this.appointmentRepository = appointmentRepository;
        this.patientRepository     = patientRepository;
        this.doctorRepository      = doctorRepository;
    }

    public AppointmentResponseDto createAppointment(AppointmentRequestDto dto) {
        Patient patient = patientRepository.findById(dto.patientId())
                .orElseThrow(() -> new RuntimeException("Patient not found with ID: " + dto.patientId()));
        Doctor doctor = doctorRepository.findById(dto.doctorId())
                .orElseThrow(() -> new RuntimeException("Doctor not found with ID: " + dto.doctorId()));

        Appointment appt = new Appointment();
        appt.setPatient(patient);
        appt.setDoctor(doctor);
        appt.setAppointmentDate(dto.appointmentDate());
        appt.setTimeSlot(dto.timeSlot());
        appt.setType(dto.type());
        appt.setNotes(dto.notes());
        return mapToDto(appointmentRepository.save(appt));
    }

    public List<AppointmentResponseDto> getAllAppointments() {
        return appointmentRepository.findAllByOrderByAppointmentDateDescTimeSlotAsc()
                .stream().map(this::mapToDto).collect(Collectors.toList());
    }

    public List<AppointmentResponseDto> getTodayAppointments() {
        return appointmentRepository.findTodayAppointments(LocalDate.now())
                .stream().map(this::mapToDto).collect(Collectors.toList());
    }

    public List<AppointmentResponseDto> getCalendarAppointments(int year, int month) {
        return appointmentRepository.findByMonthAndYear(year, month)
                .stream().map(this::mapToDto).collect(Collectors.toList());
    }

    public AppointmentResponseDto updateStatus(Long id, String status) {
        Appointment appt = appointmentRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Appointment not found with ID: " + id));
        appt.setStatus(status.toUpperCase());
        return mapToDto(appointmentRepository.save(appt));
    }

    public void deleteAppointment(Long id) {
        if (!appointmentRepository.existsById(id)) {
            throw new RuntimeException("Appointment not found with ID: " + id);
        }
        appointmentRepository.deleteById(id);
    }

    private AppointmentResponseDto mapToDto(Appointment a) {
        Patient p = a.getPatient();
        Doctor  d = a.getDoctor();
        return new AppointmentResponseDto(
                a.getId(),
                p.getId(), p.getFirstName(), p.getLastName(),
                d.getId(), d.getFirstName(), d.getLastName(), d.getSpecialty(),
                a.getAppointmentDate(), a.getTimeSlot(),
                a.getStatus(), a.getType(), a.getNotes(), a.getCreatedAt()
        );
    }
}
