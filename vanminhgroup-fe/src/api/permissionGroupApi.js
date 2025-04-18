import axiosClient from './axiosClient';

const permissionGroupApi = {
    getAll: (params) => {
        const url = '/permission-groups';
        return axiosClient.get(url, { params });
    },

    getById: (id) => {
        const url = `/permission-groups/${id}`;
        return axiosClient.get(url);
    },

    create: (data) => {
        const url = '/permission-groups';
        return axiosClient.post(url, data);
    },

    update: (id, data) => {
        const url = `/permission-groups/${id}`;
        return axiosClient.put(url, data);
    },

    delete: (id) => {
        const url = `/permission-groups/${id}`;
        return axiosClient.delete(url);
    },

    getPermissions: (groupId) => {
        const url = `/permission-groups/${groupId}/permissions`;
        return axiosClient.get(url);
    },

    assignPermissions: (groupId, permissionIds) => {
        const url = `/permission-groups/${groupId}/permissions`;
        return axiosClient.post(url, { permissionIds });
    }
};

export default permissionGroupApi; 