import api from './api';

export const getSchools = async () => {
    try {
        console.log('Making getSchools API request...');
        const response = await api.get('/schools');
        console.log('getSchools response:', response.data);
        return response.data.schools || [];
    } catch (error) {
        console.error('getSchools error:', error);
        throw error.response?.data?.error || error.message || 'Failed to fetch schools';
    }
};

export const getPublicSchools = async () => {
    try {
        console.log('Making getPublicSchools API request...');
        const response = await api.get('/schools/public');
        console.log('getPublicSchools response:', response.data);
        return response.data.schools || [];
    } catch (error) {
        console.error('getPublicSchools error:', error);
        return []; // Return empty array instead of throwing to avoid breaking registration form
    }
};

export const getSchool = async (id) => {
    try {
        console.log('Making getSchool API request for id:', id);
        const response = await api.get(`/schools/${id}`);
        console.log('getSchool response:', response.data);
        return response.data;
    } catch (error) {
        console.error('getSchool error:', error);
        throw error.response?.data?.error || error.message || 'Failed to fetch school';
    }
};

export const createSchool = async (schoolData) => {
    try {
        console.log('Making createSchool API request with data:', schoolData);
        const response = await api.post('/schools', schoolData);
        console.log('createSchool response:', response.data);
        return response.data.school;
    } catch (error) {
        console.error('createSchool error:', error);
        throw error.response?.data?.error || error.message || 'Failed to create school';
    }
};

export const updateSchool = async (id, schoolData) => {
    try {
        console.log('Making updateSchool API request for id:', id, 'with data:', schoolData);
        const response = await api.put(`/schools/${id}`, schoolData);
        console.log('updateSchool response:', response.data);
        return response.data.school;
    } catch (error) {
        console.error('updateSchool error:', error);
        throw error.response?.data?.error || error.message || 'Failed to update school';
    }
};

export const deleteSchool = async (id) => {
    try {
        console.log('Making deleteSchool API request for id:', id);
        const response = await api.delete(`/schools/${id}`);
        console.log('deleteSchool response:', response.data);
        return response.data;
    } catch (error) {
        console.error('deleteSchool error:', error);
        throw error.response?.data?.error || error.message || 'Failed to delete school';
    }
}; 