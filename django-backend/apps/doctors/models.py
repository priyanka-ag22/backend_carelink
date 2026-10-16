from django.db import models


class Doctor(models.Model):
    name = models.CharField(max_length=150)
    specialization = models.CharField(max_length=150)
    contact_number = models.CharField(max_length=15)
    email = models.EmailField(unique=True)
    available_days = models.CharField(
        max_length=100,
        blank=True,
        default='',
        help_text='Comma-separated days, e.g. Monday,Wednesday,Friday',
    )
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'doctors'
        ordering = ['-created_at']

    def __str__(self):
        return f'Dr. {self.name} ({self.specialization})'
