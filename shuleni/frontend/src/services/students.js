import api from './api';

export const getStudents = async () => {
    try {
        const response = await api.get('/users?role=student');
        return response.data.users;
    } catch (error) {
        throw error.response?.data || error.message;
    }
};

export const getStudent = async (id) => {
    try {
        const response = await api.get(`/users/${id}`);
        return response.data;
    } catch (error) {
        throw error.response?.data || error.message;
    }
};

export const createStudent = async (studentData) => {
    try {
        const response = await api.post('/users', { ...studentData, role: 'student' });
        return response.data.user;
    } catch (error) {
        throw error.response?.data || error.message;
    }
};

export const updateStudent = async (id, studentData) => {
    try {
        const response = await api.put(`/users/${id}`, studentData);
        return response.data.user;
    } catch (error) {
        throw error.response?.data || error.message;
    }
};

export const deleteStudent = async (id) => {
    try {
        const response = await api.delete(`/users/${id}`);
        return response.data;
    } catch (error) {
        throw error.response?.data || error.message;
    }
};

export const getStudentClasses = async (studentId) => {
    try {
        const response = await api.get(`/users/${studentId}/classes`);
        return response.data.classes;
    } catch (error) {
        throw error.response?.data || error.message;
    }
};

export const getStudentAssessments = async (studentId) => {
    try {
        const response = await api.get(`/users/${studentId}/assessments`);
        return response.data.assessments;
    } catch (error) {
        throw error.response?.data || error.message;
    }
}; 