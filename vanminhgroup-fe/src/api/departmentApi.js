import axios from 'axios';

const API_URL = 'http://localhost:3076/api/vanminh/departmant';

const departmentApi = {
    getAll: async () => {
        try {
            const response = await axios.get(API_URL);
            return response.data;
        } catch (error) {
            throw error;
        }
    }
};

export default departmentApi; 