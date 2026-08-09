import axios from 'axios';

const API = axios.create({
    baseURL: 'http://localhost:8080',
    headers: {
        'Content-Type': 'application/json',
    },
});

API.interceptors.response.use(
    (response) => response,
    (error) => {
        console.error('[API Error]:', error.message, error.response?.data || error);
        return Promise.reject(error);
    }
);

export const submitClaimAPI = async (claimData) => {
    const response = await API.post('/api/v1/claims', claimData);
    return response.data;
};

export default API;