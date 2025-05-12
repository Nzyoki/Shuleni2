import api from './api';

export const getAttendance = async (classId, date) => {
    try {
        const response = await api.get(`/attendance`, {
            params: { class_id: classId, date }
        });
        return response.data.attendance;
    } catch (error) {
        throw error.response?.data || error.message;
    }
};

export const markAttendance = async (classId, date, attendanceData) => {
    try {
        const response = await api.post(`/attendance`, {
            class_id: classId,
            date,
            ...attendanceData
        });
        return response.data;
    } catch (error) {
        throw error.response?.data || error.message;
    }
};

export const updateAttendance = async (attendanceId, status) => {
    try {
        const response = await api.put(`/attendance/${attendanceId}`, { status });
        return response.data;
    } catch (error) {
        throw error.response?.data || error.message;
    }
};

export const getStudentAttendance = async (studentId, startDate, endDate) => {
    try {
        const response = await api.get(`/attendance/student/${studentId}`, {
            params: { start_date: startDate, end_date: endDate }
        });
        return response.data.attendance;
    } catch (error) {
        throw error.response?.data || error.message;
    }
};

export const getClassAttendance = async (classId, startDate, endDate) => {
    try {
        const response = await api.get(`/attendance/class/${classId}`, {
            params: { start_date: startDate, end_date: endDate }
        });
        return response.data.attendance;
    } catch (error) {
        throw error.response?.data || error.message;
    }
}; 