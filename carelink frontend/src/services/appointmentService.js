import api from './api';

const appointmentService = {
    getAllAppointments: async () => {
        const r = await api.get('/api/appointments');
        return r.data;
    },
    getTodayAppointments: async () => {
        const r = await api.get('/api/appointments/today');
        return r.data;
    },
    getCalendarAppointments: async (year, month) => {
        const r = await api.get(`/api/appointments/calendar?year=${year}&month=${month}`);
        return r.data;
    },
    createAppointment: async (data) => {
        const r = await api.post('/api/appointments', data);
        return r.data;
    },
    updateStatus: async (id, status) => {
        const r = await api.patch(`/api/appointments/${id}/status`, { status });
        return r.data;
    },
    deleteAppointment: async (id) => { await api.delete(`/api/appointments/${id}`); },
};

export default appointmentService;
