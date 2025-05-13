import api from './api';

export const getAssessmentsByClass = async (classId) => {
    try {
        console.log('Fetching assessments for class:', classId);
        const response = await api.get(`/api/assessments/class/${classId}`);
        console.log('Assessment response:', response.data);
        return response.data.assessments || [];
    } catch (error) {
        console.error('Error fetching assessments:', error);
        throw error.response?.data?.error || error.message || 'Failed to fetch assessments';
    }
};

export const getAssessments = async () => {
    try {
        // This is a placeholder since there's no "get all assessments" endpoint
        // In a real app, you might want to fetch assessments for all classes
        // the current user is involved with
        console.warn('getAssessments called without a class ID - this is not directly supported by the API');
        return [];
    } catch (error) {
        console.error('Error fetching assessments:', error);
        throw error.response?.data?.error || error.message || 'Failed to fetch assessments';
    }
};

export const getAssessment = async (id) => {
    try {
        const response = await api.get(`/api/assessments/${id}`);
        return response.data;
    } catch (error) {
        console.error('Error fetching assessment details:', error);
        throw error.response?.data?.error || error.message || 'Failed to fetch assessment';
    }
};

export const createAssessment = async (classId, assessmentData) => {
    try {
        const response = await api.post(`/api/assessments/class/${classId}`, assessmentData);
        return response.data.assessment;
    } catch (error) {
        console.error('Error creating assessment:', error);
        throw error.response?.data?.error || error.message || 'Failed to create assessment';
    }
};

export const updateAssessment = async (id, assessmentData) => {
    try {
        const response = await api.put(`/api/assessments/${id}`, assessmentData);
        return response.data.assessment;
    } catch (error) {
        console.error('Error updating assessment:', error);
        throw error.response?.data?.error || error.message || 'Failed to update assessment';
    }
};

export const deleteAssessment = async (id) => {
    try {
        const response = await api.delete(`/api/assessments/${id}`);
        return response.data;
    } catch (error) {
        console.error('Error deleting assessment:', error);
        throw error.response?.data?.error || error.message || 'Failed to delete assessment';
    }
};

export const submitAssessment = async (assessmentId, submissionData) => {
    try {
        const response = await api.post(`/api/assessments/${assessmentId}/submit`, submissionData);
        return response.data;
    } catch (error) {
        console.error('Error submitting assessment:', error);
        throw error.response?.data?.error || error.message || 'Failed to submit assessment';
    }
};

export const getAssessmentSubmissions = async (assessmentId) => {
    try {
        const response = await api.get(`/api/assessments/${assessmentId}/submissions`);
        return response.data.submissions;
    } catch (error) {
        console.error('Error fetching submissions:', error);
        throw error.response?.data?.error || error.message || 'Failed to fetch submissions';
    }
};

export const gradeSubmission = async (assessmentId, submissionId, gradingData) => {
    try {
        const response = await api.post(`/api/assessments/${assessmentId}/grade/${submissionId}`, gradingData);
        return response.data.submission;
    } catch (error) {
        console.error('Error grading submission:', error);
        throw error.response?.data?.error || error.message || 'Failed to grade submission';
    }
}; 