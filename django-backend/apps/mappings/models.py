from django.db import models
from apps.patients.models import Patient
from apps.doctors.models import Doctor


class PatientDoctorMapping(models.Model):
    """Associates a doctor with a patient. Prevents duplicate assignments."""

    patient = models.ForeignKey(
        Patient,
        on_delete=models.CASCADE,
        related_name='doctor_mappings',
    )
    doctor = models.ForeignKey(
        Doctor,
        on_delete=models.CASCADE,
        related_name='patient_mappings',
    )
    assigned_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'patient_doctor_mappings'
        unique_together = ('patient', 'doctor')
        ordering = ['-assigned_at']

    def __str__(self):
        return f'{self.patient.name} → Dr. {self.doctor.name}'
