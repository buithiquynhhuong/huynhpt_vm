import axios from 'axios';

const API_URL = 'http://localhost:3076/api/vanminh/account-vanminh';

const userApi = {
    getAll: async (page = 1, limit = 10) => {
        try {
            const token = localStorage.getItem('token');
            
            const response = await axios.get(API_URL, {
                
                params: { page, limit },
                headers: {
                    'Authorization': token
                }
            });
            console.log('response_userApi   ', response);
            return response.data;
        } catch (error) {
            throw error;
        }
    },

    getById: async (id) => {
        try {
            const response = await axios.get(`${API_URL}/${id}`);
            return response.data;
        } catch (error) {
            throw error;
        }
    },

    create: async (userData) => {
        try {
            const response = await axios.post(`${API_URL}/register`, userData);
            return response.data;
        } catch (error) {
            throw error;
        }
    },

    update: async (id, userData) => {
        try {
            const response = await axios.put(`${API_URL}/update/${id}`, userData);
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
    },

    login: async (credentials) => {
        try {
            const response = await axios.post(`${API_URL}/login`, credentials);
            return response.data;
        } catch (error) {
            throw error;
        }
    },

    register: async (data) => {
        try {
            const response = await axios.post(`${API_URL}/register`, data);
            return response.data;
        } catch (error) {
            throw error;
        }
    },

    getProfile: async () => {
        try {
            const response = await axios.get(`${API_URL}/profile`);
            return response.data;
        } catch (error) {
            throw error;
        }
    },

    updateProfile: async (data) => {
        try {
            const response = await axios.put(`${API_URL}/profile`, data);
            return response.data;
        } catch (error) {
            throw error;
        }
    },

    changePassword: async (userId, data) => {
        try {
            const response = await axios.post(`${API_URL}/${userId}/change-password`, data);
            return response.data;
        } catch (error) {
            throw error;
        }
    },

    getRoles: async (userId) => {
        try {
            const response = await axios.get(`${API_URL}/${userId}/roles`);
            return response.data;
        } catch (error) {
            throw error;
        }
    },

    assignRoles: async (userId, roleIds) => {
        try {
            const response = await axios.post(`${API_URL}/${userId}/roles`, { roleIds });
            return response.data;
        } catch (error) {
            throw error;
        }
    },

    resetPassword: async (userId) => {
        try {
            const response = await axios.post(`${API_URL}/${userId}/reset-password`);
            return response.data;
        } catch (error) {
            throw error;
        }
    }
};

export default userApi; 