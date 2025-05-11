import api from './api';

export const getClasses = async () => {
    try {
        const response = await api.get('/classes');
        return response.data.classes;
    } catch (error) {
        throw error.response?.data || error.message;
    }
};

export const getClass = async (id) => {
    try {
        const response = await api.get(`/classes/${id}`);
        return response.data;
    } catch (error) {
        throw error.response?.data || error.message;
    }
};

export const createClass = async (classData) => {
    try {
        const response = await api.post('/classes', classData);
        return response.data.class;
    } catch (error) {
        throw error.response?.data || error.message;
    }
};

export const updateClass = async (id, classData) => {
    try {
        const response = await api.put(`/classes/${id}`, classData);
        return response.data.class;
    } catch (error) {
        throw error.response?.data || error.message;
    }
};

export const deleteClass = async (id) => {
    try {
        const response = await api.delete(`/classes/${id}`);
        return response.data;
    } catch (error) {
        throw error.response?.data || error.message;
    }
};

export const addStudentToClass = async (classId, studentId) => {
    try {
        const response = await api.post(`/classes/${classId}/students`, { student_id: studentId });
        return response.data;
    } catch (error) {
        throw error.response?.data || error.message;
    }
};

export const removeStudentFromClass = async (classId, studentId) => {
    try {
        const response = await api.delete(`/classes/${classId}/students/${studentId}`);
        return response.data;
    } catch (error) {
        throw error.response?.data || error.message;
    }
}; 