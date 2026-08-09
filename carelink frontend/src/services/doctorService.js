import api from './api';

const doctorService = {
    getAllDoctors: async () => {
        const r = await api.get('/api/doctors');
        return r.data.map((d) => ({ ...d, docId: `DOC-${String(d.id).padStart(4, '0')}`, fullName: `Dr. ${d.firstName} ${d.lastName}` }));
    },
    searchDoctors: async (q = '', specialty = '', gender = '') => {
        const params = new URLSearchParams();
        if (q)         params.append('q', q);
        if (specialty) params.append('specialty', specialty);
        if (gender)    params.append('gender', gender);
        const r = await api.get(`/api/doctors/search?${params.toString()}`);
        return r.data.map((d) => ({ ...d, docId: `DOC-${String(d.id).padStart(4, '0')}`, fullName: `Dr. ${d.firstName} ${d.lastName}` }));
    },
    createDoctor: async (data) => {
        const r = await api.post('/api/doctors', data);
        return { ...r.data, docId: `DOC-${String(r.data.id).padStart(4, '0')}`, fullName: `Dr. ${r.data.firstName} ${r.data.lastName}` };
    },
    updateDoctor: async (id, data) => {
        const r = await api.put(`/api/doctors/${id}`, data);
        return { ...r.data, docId: `DOC-${String(r.data.id).padStart(4, '0')}`, fullName: `Dr. ${r.data.firstName} ${r.data.lastName}` };
    },
    deleteDoctor: async (id) => { await api.delete(`/api/doctors/${id}`); },
};

export default doctorService;
