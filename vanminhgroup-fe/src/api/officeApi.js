import axios from 'axios';

const API_URL = 'http://localhost:3076/api/vanminh/office';

const officeApi = {
    getAll: async () => {
        try {
            const response = await axios.get(API_URL);
            return response.data;
        } catch (error) {
            throw error;
        }
    },

    getByDepartment: async (departmentId) => {
        try {
            const response = await axios.get(`${API_URL}/${departmentId}`);
            return response.data;
        } catch (error) {
            throw error;
        }
    }
};

export default officeApi; 