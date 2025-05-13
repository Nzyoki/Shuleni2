import api from './api';

export const getClasses = async () => {
    try {
        const response = await api.get('/api/classes');
        return response.data.classes || [];
    } catch (error) {
        console.error('Error fetching classes:', error);
        throw error.response?.data?.error || error.message || 'Failed to fetch classes';
    }
};

export const getClass = async (id) => {
    try {
        const response = await api.get(`/api/classes/${id}`);
        return response.data;
    } catch (error) {
        console.error('Error fetching class details:', error);
        throw error.response?.data?.error || error.message || 'Failed to fetch class';
    }
};

export const createClass = async (classData) => {
    try {
        const response = await api.post('/api/classes', classData);
        return response.data.class;
    } catch (error) {
        console.error('Error creating class:', error);
        throw error.response?.data?.error || error.message || 'Failed to create class';
    }
};

export const updateClass = async (id, classData) => {
    try {
        const response = await api.put(`/api/classes/${id}`, classData);
        return response.data.class;
    } catch (error) {
        console.error('Error updating class:', error);
        throw error.response?.data?.error || error.message || 'Failed to update class';
    }
};

export const deleteClass = async (id) => {
    try {
        const response = await api.delete(`/api/classes/${id}`);
        return response.data;
    } catch (error) {
        console.error('Error deleting class:', error);
        throw error.response?.data?.error || error.message || 'Failed to delete class';
    }
};

export const addStudentToClass = async (classId, studentId) => {
    try {
        const response = await api.post(`/api/classes/${classId}/students`, { student_id: studentId });
        return response.data;
    } catch (error) {
        console.error('Error adding student to class:', error);
        throw error.response?.data?.error || error.message || 'Failed to add student to class';
    }
};

export const removeStudentFromClass = async (classId, studentId) => {
    try {
        const response = await api.delete(`/api/classes/${classId}/students/${studentId}`);
        return response.data;
    } catch (error) {
        console.error('Error removing student from class:', error);
        throw error.response?.data?.error || error.message || 'Failed to remove student from class';
    }
}; 