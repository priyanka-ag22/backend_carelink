from django.db import models
from django.contrib.auth import get_user_model

User = get_user_model()

class Patient(models.Model):
    """Patient record owned by a user."""
    name = models.CharField(max_length=255)
    age = models.PositiveIntegerField()
    gender = models.CharField(max_length=20)
    address = models.TextField(blank=True)
    phone = models.CharField(max_length=20, blank=True)
    created_by = models.ForeignKey(User, on_delete=models.CASCADE, related_name='patients')

    def __str__(self):
        return f"{self.name} (ID:{self.id})"

class Doctor(models.Model):
    """Doctor information."""
    name = models.CharField(max_length=255)
    specialty = models.CharField(max_length=255)
    phone = models.CharField(max_length=20, blank=True)
    email = models.EmailField(unique=True)

    def __str__(self):
        return f"Dr. {self.name} - {self.specialty}"

class PatientDoctorMapping(models.Model):
    """Explicit mapping between a patient and a doctor.
    Allows a patient to have multiple doctors and vice‑versa.
    """
    patient = models.ForeignKey(Patient, on_delete=models.CASCADE, related_name='doctor_mappings')
    doctor = models.ForeignKey(Doctor, on_delete=models.CASCADE, related_name='patient_mappings')
    assigned_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ('patient', 'doctor')
        ordering = ['-assigned_at']

    def __str__(self):
        return f"{self.patient.name} ↔ Dr.{self.doctor.name}"
