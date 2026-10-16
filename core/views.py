from rest_framework import viewsets, status, generics, permissions
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework_simplejwt.views import TokenObtainPairView
from .models import Patient, Doctor, PatientDoctorMapping
from .serializers import (
    UserRegisterSerializer,
    PatientSerializer,
    DoctorSerializer,
    MappingSerializer,
)
from django.contrib.auth import get_user_model

User = get_user_model()

class RegisterView(generics.CreateAPIView):
    """Endpoint for user registration.
    URL: /api/auth/register/
    """
    queryset = User.objects.all()
    serializer_class = UserRegisterSerializer
    permission_classes = [permissions.AllowAny]

class ObtainTokenPairView(TokenObtainPairView):
    """JWT token obtain view – uses SimpleJWT's built‑in implementation."""
    permission_classes = [permissions.AllowAny]

class PatientViewSet(viewsets.ModelViewSet):
    """CRUD for Patient. Only the owner can list/create/read/update/delete their patients."""
    serializer_class = PatientSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return Patient.objects.filter(created_by=self.request.user)

    def perform_create(self, serializer):
        serializer.save(created_by=self.request.user)

class DoctorViewSet(viewsets.ModelViewSet):
    """CRUD for Doctor. Any authenticated user can manage doctors."""
    queryset = Doctor.objects.all()
    serializer_class = DoctorSerializer
    permission_classes = [permissions.IsAuthenticated]

class MappingViewSet(viewsets.ModelViewSet):
    """Endpoints to assign doctors to patients and retrieve mappings.
    - POST /api/mappings/ : assign
    - GET /api/mappings/ : list all mappings (optionally filter by patient_id query param)
    - GET /api/mappings/<pk>/ : retrieve specific mapping
    - DELETE /api/mappings/<pk>/ : remove assignment
    """
    queryset = PatientDoctorMapping.objects.select_related('patient', 'doctor').all()
    serializer_class = MappingSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        queryset = super().get_queryset()
        patient_id = self.request.query_params.get('patient_id')
        if patient_id:
            queryset = queryset.filter(patient_id=patient_id)
        return queryset
