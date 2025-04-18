import axios from 'axios';

const axiosClient = axios.create({
    baseURL: 'http://localhost:3076/api/vanminh',
    headers: {
        'Content-Type': 'application/json',
    },
});

// Add a request interceptor
axiosClient.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('token');
        console.log('Token trong interceptor:', token);
        
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
            console.log('Header Authorization:', config.headers.Authorization);
        } else {
            console.warn('Không tìm thấy token trong localStorage');
        }
        
        console.log('Request config:', config);
        return config;
    },
    (error) => {
        console.error('Request error:', error);
        return Promise.reject(error);
    }
);

// Add a response interceptor
axiosClient.interceptors.response.use(
    (response) => {
        console.log('Response:', response);
        return response.data;
    },
    (error) => {
        console.error('Response error:', error.response?.data || error.message);
        if (error.response?.status === 401) {
            // Token hết hạn hoặc không hợp lệ
            localStorage.removeItem('token');
            window.location.href = '/login';
        }
        return Promise.reject(error);
    }
);

export default axiosClient; 