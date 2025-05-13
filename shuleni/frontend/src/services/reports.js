import api from './api';

/**
 * Get analytics data for dashboard or reports
 * @param {string} type - The type of analytics to fetch (performance, attendance, etc.)
 * @param {Object} dateRange - Date range for analytics
 * @returns {Promise} - Promise with analytics data
 */
export const getAnalytics = async (type = 'performance', dateRange = {}) => {
    try {
        let queryParams = `?type=${type}`;

        if (dateRange.startDate) {
            queryParams += `&start_date=${dateRange.startDate}`;
        }

        if (dateRange.endDate) {
            queryParams += `&end_date=${dateRange.endDate}`;
        }

        const response = await api.get(`/reports/analytics${queryParams}`);
        return response.data;
    } catch (error) {
        console.error('Error fetching analytics:', error);
        throw error.response?.data?.error || error.message || 'Failed to fetch analytics';
    }
};

/**
 * Get performance report data
 * @param {number} classId - Optional class ID to filter by
 * @returns {Promise} - Promise with performance data
 */
export const getPerformanceReport = async (classId = null) => {
    try {
        let url = '/reports/performance';
        if (classId) {
            url += `?class_id=${classId}`;
        }

        const response = await api.get(url);
        return response.data;
    } catch (error) {
        console.error('Error fetching performance report:', error);
        throw error.response?.data?.error || error.message || 'Failed to fetch performance report';
    }
};

/**
 * Generate custom report with specified parameters
 * @param {Object} params - Report parameters
 * @returns {Promise} - Promise with report data
 */
export const generateReport = async (params) => {
    try {
        const response = await api.post('/reports/generate', params);
        return response.data;
    } catch (error) {
        console.error('Error generating report:', error);
        throw error.response?.data?.error || error.message || 'Failed to generate report';
    }
}; 