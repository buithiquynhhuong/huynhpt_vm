import axios from 'axios';

const API_URL = 'http://localhost:3076/api/vanminh/car';

const getAuthConfig = () => {
    const token = localStorage.getItem('token');
    return {
        headers: {
            'Authorization': token
        }
    };
};

const carApi = {
    getAll: async (params) => {
        try {
            const response = await axios.get(API_URL, {
                ...getAuthConfig(),
                params
            });
            return response.data;
        } catch (error) {
            throw error;
        }
    },

    getById: async (id) => {
        try {
            const response = await axios.get(`${API_URL}/${id}`, getAuthConfig());
            return response.data;
        } catch (error) {
            throw error;
        }
    },

    create: async (data) => {
        try {
            const response = await axios.post(API_URL, data, getAuthConfig());
            return response.data;
        } catch (error) {
            throw error;
        }
    },

    update: async (id, data) => {
        try {
            const response = await axios.put(`${API_URL}/${id}`, data, getAuthConfig());
            return response.data;
        } catch (error) {
            throw error;
        }
    },

    delete: async (id) => {
        try {
            const response = await axios.delete(`${API_URL}/${id}`, getAuthConfig());
            return response.data;
        } catch (error) {
            throw error;
        }
    }
};

export default carApi; 