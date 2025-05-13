import api from './api';

export const login = async (credentials) => {
    try {
        const response = await api.post('/auth/login', {
            email: credentials.email,
            password: credentials.password
        });

        if (response.data.access_token) {
            localStorage.setItem('token', response.data.access_token);
            return response.data;
        }
        throw new Error('No access token received');
    } catch (error) {
        console.error('Login error:', error.response?.data || error.message);
        throw new Error(error.response?.data?.error || 'Login failed');
    }
};

export const register = async (userData) => {
    try {
        const response = await api.post('/auth/register', userData);
        if (response.data.access_token) {
            localStorage.setItem('token', response.data.access_token);
            return response.data;
        }
        throw new Error('No access token received');
    } catch (error) {
        console.error('Registration error:', error.response?.data || error.message);
        throw new Error(error.response?.data?.error || 'Registration failed');
    }
};

export const logout = () => {
    localStorage.removeItem('token');
    window.location.href = '/login';
};

export const getCurrentUser = async () => {
    try {
        const response = await api.get('/auth/me');
        return response.data;
    } catch (error) {
        console.error('Get current user error:', error.response?.data || error.message);
        throw new Error(error.response?.data?.error || 'Failed to get current user');
    }
};

export const isAuthenticated = () => {
    return !!localStorage.getItem('token');
};

export const hasPermission = (user, permission) => {
    if (!user || !user.role) return false;

    const rolePermissions = {
        super_admin: [
            // Platform Management
            'manage_platform',
            'manage_schools',
            'manage_all_users',
            'view_analytics',
            'manage_settings',

            // School Management
            'manage_school',
            'manage_teachers',
            'manage_students',
            'manage_classes',
            'manage_resources',
            'manage_assessments',
            'view_attendance',
            'monitor_chat',
            'view_school_reports',

            // Class Management
            'manage_class',
            'take_attendance',
            'create_assessments',
            'grade_assessments',
            'send_notifications',
            'view_class_reports',

            // Resource Management
            'manage_resources',
            'view_resources',

            // Assessment Management
            'manage_assessments',
            'take_assessments',

            // User Management
            'manage_users',
            'manage_all_users',
            'create_users',
            'edit_users',
            'delete_users',
            'view_users',
            'update_profile',

            // Communication
            'participate_chat',

            // Reports and Analytics
            'view_reports',
            'view_analytics',
            'view_attendance',
            'view_school_reports',
            'view_class_reports'
        ],
        school_admin: [
            // School Management
            'manage_school',
            'manage_teachers',
            'manage_students',
            'manage_school_students',
            'manage_classes',
            'manage_school_classes',
            'manage_resources',
            'manage_assessments',
            'view_attendance',
            'manage_attendance',
            'take_attendance',
            'monitor_chat',
            'view_school_reports',

            // User Management for their school
            'view_users',
            'manage_users',
            'create_users',
            'edit_users',
            'delete_users',

            // Analytics specifically for their school
            'view_analytics',
            'view_school_analytics',
            'view_reports',
            'view_school_reports',

            // Resource Management
            'manage_resources',
            'view_resources',
            'create_resources',
            'edit_resources',
            'delete_resources',

            // Assessment Management
            'manage_assessments',
            'view_assessments',
            'create_assessments',
            'edit_assessments',
            'grade_assessments',

            // Class Management
            'view_class_students',
            'manage_class_students',
            'view_class_reports',
            'manage_class_assessments',

            // Communication within school
            'participate_chat',
            'send_notifications'
        ],
        teacher: [
            'manage_class',
            'take_attendance',
            'manage_resources',
            'create_assessments',
            'grade_assessments',
            'participate_chat',
            'send_notifications',
            'view_class_reports'
        ],
        student: [
            'view_resources',
            'take_assessments',
            'view_attendance',
            'participate_chat',
            'update_profile'
        ]
    };

    // If permission is an array, check if user has any of them
    if (Array.isArray(permission)) {
        return permission.some(perm => rolePermissions[user.role]?.includes(perm));
    }
    return rolePermissions[user.role]?.includes(permission) || false;
};

export const getToken = () => {
    return localStorage.getItem('token');
};

export const setToken = (token) => {
    localStorage.setItem('token', token);
};

export const removeToken = () => {
    localStorage.removeItem('token');
}; 