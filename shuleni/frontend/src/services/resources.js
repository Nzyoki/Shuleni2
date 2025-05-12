import api from './api';

export const getResources = async () => {
    try {
        const response = await api.get('/resources');
        return response.data.resources;
    } catch (error) {
        throw error.response?.data || error.message;
    }
};

export const getResource = async (id) => {
    try {
        const response = await api.get(`/resources/${id}`);
        return response.data;
    } catch (error) {
        throw error.response?.data || error.message;
    }
};

export const createResource = async (resourceData) => {
    try {
        const response = await api.post('/resources', resourceData);
        return response.data.resource;
    } catch (error) {
        throw error.response?.data || error.message;
    }
};

export const updateResource = async (id, resourceData) => {
    try {
        const response = await api.put(`/resources/${id}`, resourceData);
        return response.data.resource;
    } catch (error) {
        throw error.response?.data || error.message;
    }
};

export const deleteResource = async (id) => {
    try {
        const response = await api.delete(`/resources/${id}`);
        return response.data;
    } catch (error) {
        throw error.response?.data || error.message;
    }
};

export const uploadResourceFile = async (resourceId, file) => {
    try {
        const formData = new FormData();
        formData.append('file', file);
        const response = await api.post(`/resources/${resourceId}/upload`, formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
        });
        return response.data;
    } catch (error) {
        throw error.response?.data || error.message;
    }
}; 