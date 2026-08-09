import api from './api';

const fmt = (id) => `PAT-${String(id).padStart(6, '0')}`;

const toModel = (p) => ({
    ...p,
    patId: fmt(p.id),
    fullName: `${p.firstName} ${p.lastName}`,
});

const patientService = {
    registerPatient: async (fields) => {
        const payload = {
            firstName:        fields.firstName,
            lastName:         fields.lastName,
            email:            fields.email,
            dateOfBirth:      fields.dateOfBirth,
            gender:           fields.gender,
            bloodGroup:       fields.bloodGroup,
            contactNumber:    fields.contactNumber,
            emergencyContact: fields.emergencyContact,
            address:          fields.address,
        };
        const response = await api.post('/api/patients/register', payload);
        const patient = toModel(response.data);
        return {
            success: true,
            message: `${patient.firstName} ${patient.lastName} registered successfully.`,
            data: patient,
        };
    },

    getAllPatients: async () => {
        const response = await api.get('/api/patients/all');
        return response.data.map(toModel);
    },

    searchPatients: async (q = '', gender = '', bloodGroup = '') => {
        const params = new URLSearchParams();
        if (q)          params.append('q', q);
        if (gender)     params.append('gender', gender);
        if (bloodGroup) params.append('bloodGroup', bloodGroup);
        const response = await api.get(`/api/patients/search?${params.toString()}`);
        return response.data.map(toModel);
    },

    updatePatient: async (id, fields) => {
        const response = await api.put(`/api/patients/${id}`, fields);
        return toModel(response.data);
    },

    deletePatient: async (id) => {
        await api.delete(`/api/patients/${id}`);
    },
};

export default patientService;
