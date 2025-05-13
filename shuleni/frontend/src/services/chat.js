import axios from './axios';
import { socketService } from './socket';

export const getMessages = async (chatId) => {
    try {
        const response = await axios.get(`/api/chat/messages/${chatId}`);
        return response.data;
    } catch (error) {
        throw error.response?.data || error.message;
    }
};

export const getChatContacts = async () => {
    try {
        const response = await axios.get('/api/chat/contacts');
        return response.data;
    } catch (error) {
        throw error.response?.data || error.message;
    }
};

export const getNotificationCount = async () => {
    try {
        const response = await axios.get('/api/chat/notifications/count');
        return response.data;
    } catch (error) {
        throw error.response?.data || error.message;
    }
};

export const markNotificationsRead = async () => {
    try {
        const response = await axios.post('/api/chat/notifications/read');
        return response.data;
    } catch (error) {
        throw error.response?.data || error.message;
    }
};

export const sendMessage = (chatId, message) => {
    const socket = socketService.getSocket();
    socket.emit('send_message', { chat_id: chatId, message });
};

export const subscribeToMessages = (callback) => {
    const socket = socketService.getSocket();
    
    socket.on('new_message', callback);
    socket.on('notification_update', ({ count }) => {
        // Update notification count in the UI
        const event = new CustomEvent('chat_notification_update', { detail: { count } });
        window.dispatchEvent(event);
    });
    
    return () => {
        socket.off('new_message');
        socket.off('notification_update');
    };
};

export const subscribeToUserConnection = (callback) => {
    const socket = socketService.getSocket();
    socket.on('user_connected', callback);
    return () => socket.off('user_connected', callback);
}; 