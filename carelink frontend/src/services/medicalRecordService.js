import api from './api';

const medicalRecordService = {
    getAllRecords: async (patientId = null) => {
        const url = patientId ? `/api/medical-records?patientId=${patientId}` : '/api/medical-records';
        const r = await api.get(url);
        return r.data;
    },
    createRecord: async (recordData, file = null) => {
        const form = new FormData();
        form.append('record', new Blob([JSON.stringify(recordData)], { type: 'application/json' }));
        if (file) form.append('file', file);
        const r = await api.post('/api/medical-records', form, {
            headers: { 'Content-Type': 'multipart/form-data' },
        });
        return r.data;
    },
    updateRecord: async (id, recordData, file = null) => {
        const form = new FormData();
        form.append('record', new Blob([JSON.stringify(recordData)], { type: 'application/json' }));
        if (file) form.append('file', file);
        const r = await api.put(`/api/medical-records/${id}`, form, {
            headers: { 'Content-Type': 'multipart/form-data' },
        });
        return r.data;
    },
    deleteRecord: async (id) => { await api.delete(`/api/medical-records/${id}`); },
};

export default medicalRecordService;
