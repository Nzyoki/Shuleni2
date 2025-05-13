import api from '../services/api';

/**
 * Utility function to automatically enroll all students in their school's classes
 * This is helpful for testing and demo purposes
 * @returns {Promise<Object>} The response from the server
 */
export const autoEnrollStudents = async () => {
    try {
        const response = await api.post('/api/classes/auto-enroll-students');
        return response.data;
    } catch (error) {
        console.error('Error auto-enrolling students:', error);
        throw error.response?.data?.error || error.message || 'Failed to auto-enroll students';
    }
};

export default {
    autoEnrollStudents
}; 