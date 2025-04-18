import axiosClient from './axiosClient';

const roleApi = {
    getAll: (params) => {
        const url = '/roles';
        return axiosClient.get(url, { params });
    },

    getById: (id) => {
        const url = `/roles/${id}`;
        return axiosClient.get(url);
    },

    create: (data) => {
        const url = '/roles';
        return axiosClient.post(url, data);
    },

    update: (id, data) => {
        const url = `/roles/${id}`;
        return axiosClient.put(url, data);
    },

    delete: (id) => {
        const url = `/roles/${id}`;
        return axiosClient.delete(url);
    },

    getPermissions: (roleId) => {
        const url = `/roles/${roleId}/permissions`;
        return axiosClient.get(url);
    },

    assignPermissions: (roleId, permissionIds) => {
        const url = `/roles/${roleId}/permissions`;
        return axiosClient.post(url, { permissionIds });
    },

    getUsers: (roleId) => {
        const url = `/roles/${roleId}/users`;
        return axiosClient.get(url);
    }
};

export default roleApi; 