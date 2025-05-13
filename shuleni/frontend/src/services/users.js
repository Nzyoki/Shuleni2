import api from './api';

export const getUsers = async (filters = {}) => {
    try {
        console.log('Making getUsers API request with filters:', filters);
        const queryParams = new URLSearchParams();

        if (filters.role) {
            queryParams.append('role', filters.role);
        }

        if (filters.school_id) {
            queryParams.append('school_id', filters.school_id);
        }

        const url = `/users${queryParams.toString() ? '?' + queryParams.toString() : ''}`;
        const response = await api.get(url);
        console.log('getUsers response:', response.data);
        return response.data.users || [];
    } catch (error) {
        console.error('getUsers error:', error);
        throw error.response?.data?.error || error.message || 'Failed to fetch users';
    }
};

export const getUser = async (id) => {
    try {
        console.log('Making getUser API request for id:', id);
        const response = await api.get(`/users/${id}`);
        console.log('getUser response:', response.data);
        return response.data;
    } catch (error) {
        console.error('getUser error:', error);
        throw error.response?.data?.error || error.message || 'Failed to fetch user';
    }
};

export const createUser = async (userData) => {
    try {
        console.log('Making createUser API request with data:', userData);
        const response = await api.post('/users', userData);
        console.log('createUser response:', response.data);
        return response.data.user;
    } catch (error) {
        console.error('createUser error:', error);
        throw error.response?.data?.error || error.message || 'Failed to create user';
    }
};

export const updateUser = async (id, userData) => {
    try {
        console.log('Making updateUser API request for id:', id, 'with data:', userData);
        const response = await api.put(`/users/${id}`, userData);
        console.log('updateUser response:', response.data);
        return response.data.user;
    } catch (error) {
        console.error('updateUser error:', error);
        throw error.response?.data?.error || error.message || 'Failed to update user';
    }
};

export const deleteUser = async (id) => {
    try {
        console.log('Making deleteUser API request for id:', id);
        const response = await api.delete(`/users/${id}`);
        console.log('deleteUser response:', response.data);
        return response.data;
    } catch (error) {
        console.error('deleteUser error:', error);
        throw error.response?.data?.error || error.message || 'Failed to delete user';
    }
}; 