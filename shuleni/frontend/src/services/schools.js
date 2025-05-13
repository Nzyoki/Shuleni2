import api from './api';

export const getSchools = async () => {
    try {
        const response = await api.get('/api/schools');
        return response.data.schools || [];
    } catch (error) {
        console.error('Error fetching schools:', error);
        throw error.response?.data?.error || error.message || 'Failed to fetch schools';
    }
};

export const getPublicSchools = async () => {
    try {
        const response = await api.get('/api/schools/public');
        return response.data.schools || [];
    } catch (error) {
        console.error('Error fetching public schools:', error);
        return []; // Return empty array instead of throwing to avoid breaking registration form
    }
};

export const getSchool = async (id) => {
    try {
        const response = await api.get(`/api/schools/${id}`);
        return response.data;
    } catch (error) {
        console.error('Error fetching school details:', error);
        throw error.response?.data?.error || error.message || 'Failed to fetch school';
    }
};

export const createSchool = async (schoolData) => {
    try {
        const response = await api.post('/api/schools', schoolData);
        return response.data.school;
    } catch (error) {
        console.error('Error creating school:', error);
        throw error.response?.data?.error || error.message || 'Failed to create school';
    }
};

export const updateSchool = async (id, schoolData) => {
    try {
        const response = await api.put(`/api/schools/${id}`, schoolData);
        return response.data.school;
    } catch (error) {
        console.error('Error updating school:', error);
        throw error.response?.data?.error || error.message || 'Failed to update school';
    }
};

export const deleteSchool = async (id) => {
    try {
        const response = await api.delete(`/api/schools/${id}`);
        return response.data;
    } catch (error) {
        console.error('Error deleting school:', error);
        throw error.response?.data?.error || error.message || 'Failed to delete school';
    }
}; 