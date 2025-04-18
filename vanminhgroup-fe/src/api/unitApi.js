import axios from 'axios';

const API_URL = 'http://localhost:3076/api/vanminh/unit';

const unitApi = {
    getAll: async () => {
        try {
            const response = await axios.get(API_URL);
            return response.data;
        } catch (error) {
            throw error;
        }
    },

    create: async (data) => {
        try {
            const response = await axios.post(API_URL, data);
            return response.data;
        } catch (error) {
            throw error;
        }
    },

    update: async (id, data) => {
        try {
            const response = await axios.put(`${API_URL}/${id}`, data);
            return response.data;
        } catch (error) {
            throw error;
        }
    },

    delete: async (ids) => {
        try {
            const response = await axios.delete(API_URL, { data: { ids } });
            return response.data;
        } catch (error) {
            throw error;
        }
    }
};

export default unitApi; 