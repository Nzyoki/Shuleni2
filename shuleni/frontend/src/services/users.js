import api from './api';

export const getUsers = async (filters = {}) => {
    try {
        // Build query parameters
        const params = new URLSearchParams();
        if (filters.role) params.append('role', filters.role);
        if (filters.school_id) params.append('school_id', filters.school_id);

        const queryString = params.toString();
        const url = queryString ? `/api/users?${queryString}` : '/api/users';

        const response = await api.get(url);
        return response.data.users || [];
    } catch (error) {
        console.error('Error fetching users:', error);
        throw error.response?.data?.error || error.message || 'Failed to fetch users';
    }
};

export const getUser = async (id) => {
    try {
        const response = await api.get(`/api/users/${id}`);
        return response.data;
    } catch (error) {
        console.error('Error fetching user details:', error);
        throw error.response?.data?.error || error.message || 'Failed to fetch user';
    }
};

export const createUser = async (userData) => {
    try {
        const response = await api.post('/api/users', userData);
        return response.data.user;
    } catch (error) {
        console.error('Error creating user:', error);
        throw error.response?.data?.error || error.message || 'Failed to create user';
    }
};

export const updateUser = async (id, userData) => {
    try {
        const response = await api.put(`/api/users/${id}`, userData);
        return response.data.user;
    } catch (error) {
        console.error('Error updating user:', error);
        throw error.response?.data?.error || error.message || 'Failed to update user';
    }
};

export const deleteUser = async (id) => {
    try {
        const response = await api.delete(`/api/users/${id}`);
        return response.data;
    } catch (error) {
        console.error('Error deleting user:', error);
        throw error.response?.data?.error || error.message || 'Failed to delete user';
    }
}; 