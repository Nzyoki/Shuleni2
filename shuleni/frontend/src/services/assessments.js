import api from './api';

export const getAssessments = async () => {
    try {
        const response = await api.get('/assessments');
        return response.data.assessments;
    } catch (error) {
        throw error.response?.data || error.message;
    }
};

export const getAssessment = async (id) => {
    try {
        const response = await api.get(`/assessments/${id}`);
        return response.data;
    } catch (error) {
        throw error.response?.data || error.message;
    }
};

export const createAssessment = async (assessmentData) => {
    try {
        const response = await api.post('/assessments', assessmentData);
        return response.data.assessment;
    } catch (error) {
        throw error.response?.data || error.message;
    }
};

export const updateAssessment = async (id, assessmentData) => {
    try {
        const response = await api.put(`/assessments/${id}`, assessmentData);
        return response.data.assessment;
    } catch (error) {
        throw error.response?.data || error.message;
    }
};

export const deleteAssessment = async (id) => {
    try {
        const response = await api.delete(`/assessments/${id}`);
        return response.data;
    } catch (error) {
        throw error.response?.data || error.message;
    }
};

export const submitAssessment = async (assessmentId, submissionData) => {
    try {
        const response = await api.post(`/assessments/${assessmentId}/submit`, submissionData);
        return response.data;
    } catch (error) {
        throw error.response?.data || error.message;
    }
};

export const getAssessmentSubmissions = async (assessmentId) => {
    try {
        const response = await api.get(`/assessments/${assessmentId}/submissions`);
        return response.data.submissions;
    } catch (error) {
        throw error.response?.data || error.message;
    }
}; 