import axiosClient from './axiosClient';

const assetApi = {
    getAll: (params) => {
        const url = '/assets';
        return axiosClient.get(url, { params });
    },

    getById: (id) => {
        const url = `/assets/${id}`;
        return axiosClient.get(url);
    },

    create: (data) => {
        const url = '/assets';
        return axiosClient.post(url, data);
    },

    update: (id, data) => {
        const url = `/assets/${id}`;
        return axiosClient.put(url, data);
    },

    delete: (id) => {
        const url = `/assets/${id}`;
        return axiosClient.delete(url);
    },

    getCategories: () => {
        const url = '/assets/categories';
        return axiosClient.get(url);
    },

    getStatuses: () => {
        const url = '/assets/statuses';
        return axiosClient.get(url);
    }
};

export default assetApi; 