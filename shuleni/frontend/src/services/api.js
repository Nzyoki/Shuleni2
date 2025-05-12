import axios from 'axios';

// Try to connect to the API with fallback options
const getApiInstance = () => {
    const instance = axios.create({
        baseURL: 'http://localhost:5000/api',
        headers: {
            'Content-Type': 'application/json',
        },
    });

    // Test connection and fallback logic
    instance.interceptors.response.use(
        (response) => response,
        (error) => {
            if (error.message === 'Network Error' && error.config) {
                // If connection fails, try fallback port
                console.log('Trying fallback API endpoint...');

                // Copy the original request configuration
                const fallbackConfig = { ...error.config };
                fallbackConfig.baseURL = 'http://127.0.0.1:5000/api';

                return axios(fallbackConfig);
            }
            return Promise.reject(error);
        }
    );

    return instance;
};

const api = getApiInstance();

// Add a request interceptor
api.interceptors.request.use(
    (config) => {
        console.log('API Request:', {
            url: config.url,
            method: config.method,
            headers: config.headers,
            data: config.data
        });
        const token = localStorage.getItem('token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        console.error('API Request Error:', error);
        return Promise.reject(error);
    }
);

// Add a response interceptor
api.interceptors.response.use(
    (response) => {
        console.log('API Response:', {
            url: response.config.url,
            status: response.status,
            data: response.data
        });
        return response;
    },
    (error) => {
        console.error('API Response Error:', {
            url: error.config?.url,
            status: error.response?.status,
            data: error.response?.data,
            message: error.message
        });
        if (error.response?.status === 401) {
            localStorage.removeItem('token');
            window.location.href = '/login';
        }
        return Promise.reject(error);
    }
);

export default api; 