import api from './api';

export const getResources = async () => {
    try {
        const response = await api.get('/api/resources');
        return response.data.resources;
    } catch (error) {
        console.error('Error fetching resources:', error);
        throw error.response?.data?.error || error.message || 'Failed to fetch resources';
    }
};

export const getClassResources = async (classId) => {
    try {
        const response = await api.get(`/api/resources/class/${classId}`);
        return response.data.resources;
    } catch (error) {
        console.error('Error fetching class resources:', error);
        throw error.response?.data?.error || error.message || 'Failed to fetch class resources';
    }
};

export const getResource = async (id) => {
    try {
        const response = await api.get(`/api/resources/${id}`);
        return response.data;
    } catch (error) {
        console.error('Error fetching resource details:', error);
        throw error.response?.data?.error || error.message || 'Failed to fetch resource';
    }
};

export const createResource = async (classId, resourceData) => {
    try {
        const formData = new FormData();

        // Add text fields to formData
        Object.keys(resourceData).forEach(key => {
            if (key !== 'file') {
                formData.append(key, resourceData[key]);
            }
        });

        // Add file if it exists
        if (resourceData.file) {
            formData.append('file', resourceData.file);
        }

        const response = await api.post(`/api/resources/class/${classId}`, formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
        });
        return response.data.resource;
    } catch (error) {
        console.error('Error creating resource:', error);
        throw error.response?.data?.error || error.message || 'Failed to create resource';
    }
};

export const updateResource = async (id, resourceData) => {
    try {
        const formData = new FormData();

        // Add text fields to formData
        Object.keys(resourceData).forEach(key => {
            if (key !== 'file') {
                formData.append(key, resourceData[key]);
            }
        });

        // Add file if it exists
        if (resourceData.file) {
            formData.append('file', resourceData.file);
        }

        const response = await api.put(`/api/resources/${id}`, formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
        });
        return response.data.resource;
    } catch (error) {
        console.error('Error updating resource:', error);
        throw error.response?.data?.error || error.message || 'Failed to update resource';
    }
};

export const deleteResource = async (id) => {
    try {
        const response = await api.delete(`/api/resources/${id}`);
        return response.data;
    } catch (error) {
        console.error('Error deleting resource:', error);
        throw error.response?.data?.error || error.message || 'Failed to delete resource';
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