import api from './api';

export const getAssessments = async () => {
    try {
        const response = await api.get('/api/assessments');
        return response.data.assessments;
    } catch (error) {
        console.error('Error fetching assessments:', error);
        throw error.response?.data?.error || error.message || 'Failed to fetch assessments';
    }
};

export const getAssessmentsByClass = async (classId) => {
    try {
        const response = await api.get(`/api/assessments/class/${classId}`);
        return response.data.assessments;
    } catch (error) {
        console.error('Error fetching class assessments:', error);
        throw error.response?.data?.error || error.message || 'Failed to fetch class assessments';
    }
};

export const getAssessment = async (assessmentId) => {
    try {
        const response = await api.get(`/api/assessments/${assessmentId}`);
        return response.data;
    } catch (error) {
        console.error('Error fetching assessment details:', error);
        throw error.response?.data?.error || error.message || 'Failed to fetch assessment';
    }
};

export const createAssessment = async (data) => {
    try {
        const response = await api.post(`/api/assessments/class/${data.class_id}`, data);
        return response.data.assessment;
    } catch (error) {
        console.error('Error creating assessment:', error);
        throw error.response?.data?.error || error.message || 'Failed to create assessment';
    }
};

export const updateAssessment = async (id, data) => {
    try {
        const response = await api.put(`/api/assessments/${id}`, data);
        return response.data.assessment;
    } catch (error) {
        console.error('Error updating assessment:', error);
        throw error.response?.data?.error || error.message || 'Failed to update assessment';
    }
};

export const deleteAssessment = async (id) => {
    try {
        await api.delete(`/api/assessments/${id}`);
    } catch (error) {
        console.error('Error deleting assessment:', error);
        throw error.response?.data?.error || error.message || 'Failed to delete assessment';
    }
};

export const submitAssessment = async (id, data) => {
    try {
        const response = await api.post(`/api/assessments/${id}/submit`, data);
        return response.data;
    } catch (error) {
        console.error('Error submitting assessment:', error);
        throw error.response?.data?.error || error.message || 'Failed to submit assessment';
    }
};

export const getAssessmentSubmissions = async (id) => {
    try {
        const response = await api.get(`/api/assessments/${id}/submissions`);
        return response.data.submissions;
    } catch (error) {
        console.error('Error fetching submissions:', error);
        throw error.response?.data?.error || error.message || 'Failed to fetch submissions';
    }
};

export const gradeSubmission = async (assessmentId, submissionId, data) => {
    try {
        const response = await api.post(`/api/assessments/${assessmentId}/grade/${submissionId}`, data);
        return response.data.submission;
    } catch (error) {
        console.error('Error grading submission:', error);
        throw error.response?.data?.error || error.message || 'Failed to grade submission';
    }
}; 