import axiosClient from './axiosClient';
import { jwtDecode } from 'jwt-decode';

const getUserIdFromToken = () => {
    const token = localStorage.getItem('token');
    console.log('Token from localStorage:', token);
    
    if (!token) {
        console.warn('No token found in localStorage');
        return null;
    }
    
    try {
        const decoded = jwtDecode(token);
        console.log('Decoded token:', decoded);
        
        // Kiểm tra cả id và _id vì có thể backend trả về một trong hai
        const userId = decoded.id || decoded._id;
        console.log('Extracted userId:', userId);
        
        if (!userId) {
            console.warn('No id found in decoded token');
            return null;
        }
        
        return userId;
    } catch (error) {
        console.error('Error decoding token:', error);
        return null;
    }
};

const assetTransferApi = {
    getLogs: (params) => {
        const url = '/asset-transfer/logs';
        return axiosClient.get(url, { params });
    },

    importAsset: (data) => {
        const url = '/asset-transfer/import';
        const userId = getUserIdFromToken();
        const requestData = { ...data, userId };
        console.log('Import Asset Request Data:', requestData);
        return axiosClient.post(url, requestData);
    },

    exportAsset: (data) => {
        const url = '/asset-transfer/export';
        const userId = getUserIdFromToken();
        console.log('UserId extracted from token:', userId);
        
        if (!userId) {
            console.error('No userId found from token');
            throw new Error('Không tìm thấy thông tin người dùng');
        }
        
        const requestData = { ...data, userId };
        console.log('Final Export Asset Request Data:', requestData);
        return axiosClient.post(url, requestData);
    },

    getInventory: (assetId) => {
        const url = `/asset-transfer/inventory/${assetId}`;
        return axiosClient.get(url);
    }
};

export default assetTransferApi; 