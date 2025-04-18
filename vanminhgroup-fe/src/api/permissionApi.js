import axiosClient from './axiosClient';

const permissionApi = {
    getAll: (params) => {
        const url = '/permissions';
        return axiosClient.get(url, { params });
    },

    getById: (id) => {
        const url = `/permissions/${id}`;
        return axiosClient.get(url);
    },

    create: (data) => {
        const url = '/permissions';
        return axiosClient.post(url, data);
    },

    update: (id, data) => {
        const url = `/permissions/${id}`;
        return axiosClient.put(url, data);
    },

    delete: (id) => {
        const url = `/permissions/${id}`;
        return axiosClient.delete(url);
    },

    getRoles: (permissionId) => {
        const url = `/permissions/${permissionId}/roles`;
        return axiosClient.get(url);
    },

    getUsers: (permissionId) => {
        const url = `/permissions/${permissionId}/users`;
        return axiosClient.get(url);
    }
};

export default permissionApi; 