import api from './api';
import { useAuth } from '../contexts/AuthContext';

export const getStudents = async (schoolId = null) => {
    try {
        // Build query parameters
        const params = new URLSearchParams();
        params.append('role', 'student');

        if (schoolId) {
            params.append('school_id', schoolId);
        }

        const response = await api.get(`/api/users?${params.toString()}`);
        return response.data.users || [];
    } catch (error) {
        console.error('Error fetching students:', error);
        throw error.response?.data?.error || error.message || 'Failed to fetch students';
    }
};

export const getStudentsBySchool = async (schoolId) => {
    if (!schoolId) {
        throw new Error('School ID is required');
    }
    return getStudents(schoolId);
};

export const getStudent = async (id) => {
    try {
        const response = await api.get(`/api/users/${id}`);
        return response.data;
    } catch (error) {
        console.error('Error fetching student details:', error);
        throw error.response?.data?.error || error.message || 'Failed to fetch student';
    }
};

export const createStudent = async (studentData) => {
    try {
        // Ensure role is set to student
        const data = {
            ...studentData,
            role: 'student'
        };

        const response = await api.post('/api/users', data);
        return response.data.user;
    } catch (error) {
        console.error('Error creating student:', error);
        throw error.response?.data?.error || error.message || 'Failed to create student';
    }
};

export const updateStudent = async (id, studentData) => {
    try {
        const response = await api.put(`/api/users/${id}`, studentData);
        return response.data.user;
    } catch (error) {
        console.error('Error updating student:', error);
        throw error.response?.data?.error || error.message || 'Failed to update student';
    }
};

export const deleteStudent = async (id) => {
    try {
        const response = await api.delete(`/api/users/${id}`);
        return response.data;
    } catch (error) {
        console.error('Error deleting student:', error);
        throw error.response?.data?.error || error.message || 'Failed to delete student';
    }
};

export const getStudentClasses = async (studentId) => {
    try {
        const response = await api.get(`/api/users/${studentId}/classes`);
        return response.data.classes;
    } catch (error) {
        console.error('Error fetching student classes:', error);
        throw error.response?.data?.error || error.message || 'Failed to fetch student classes';
    }
};

export const getStudentAssessments = async (studentId) => {
    try {
        const response = await api.get(`/api/users/${studentId}/assessments`);
        return response.data.assessments;
    } catch (error) {
        console.error('Error fetching student assessments:', error);
        throw error.response?.data?.error || error.message || 'Failed to fetch student assessments';
    }
}; 