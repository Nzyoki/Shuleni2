import React, { useState, useEffect, useRef } from 'react';
import {
    Box,
    Grid,
    Paper,
    List,
    ListItem,
    ListItemText,
    ListItemAvatar,
    ListItemSecondary,
    Avatar,
    Typography,
    TextField,
    IconButton,
    CircularProgress,
    Alert,
    Badge,
    Tooltip
} from '@mui/material';
import SendIcon from '@mui/icons-material/Send';
import PersonIcon from '@mui/icons-material/Person';
import NotificationsIcon from '@mui/icons-material/Notifications';
import { useAuth } from '../contexts/AuthContext';
import { getMessages, getChatContacts, sendMessage, subscribeToMessages, getNotificationCount, markNotificationsRead } from '../services/chat';
import { format } from 'date-fns';

const Chat = () => {
    const { user } = useAuth();
    const [contacts, setContacts] = useState([]);
    const [selectedContact, setSelectedContact] = useState(null);
    const [messages, setMessages] = useState([]);
    const [newMessage, setNewMessage] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [notificationCount, setNotificationCount] = useState(0);
    const messagesEndRef = useRef(null);

    // Fetch contacts, set up message subscription, and get notification count
    useEffect(() => {
        const fetchContacts = async () => {
            try {
                const data = await getChatContacts();
                setContacts(data);
            } catch (err) {
                setError('Failed to load contacts');
            }
        };

        const fetchNotificationCount = async () => {
            try {
                const { count } = await getNotificationCount();
                setNotificationCount(count);
            } catch (err) {
                console.error('Failed to get notification count:', err);
            }
        };

        fetchContacts();
        fetchNotificationCount();

        // Subscribe to new messages and notifications
        const unsubscribeMessages = subscribeToMessages((message) => {
            setMessages((prevMessages) => [...prevMessages, message]);
            if (message.recipient_id === user.id) {
                setNotificationCount((prev) => prev + 1);
            }
            scrollToBottom();
        });

        return () => unsubscribeMessages();
    }, [user.id]);

    // Fetch messages when a contact is selected
    useEffect(() => {
        if (selectedContact) {
            setLoading(true);
            getMessages(selectedContact.id)
                .then((data) => {
                    setMessages(data);
                    scrollToBottom();
                    // Mark notifications as read when viewing messages
                    markNotificationsRead();
                    setNotificationCount(0);
                })
                .catch(() => setError('Failed to load messages'))
                .finally(() => setLoading(false));
        }
    }, [selectedContact]);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    const handleSendMessage = (e) => {
        e.preventDefault();
        if (!newMessage.trim() || !selectedContact) return;

        sendMessage(selectedContact.id, newMessage);
        setNewMessage('');
    };

    const formatMessageTime = (timestamp) => {
        return format(new Date(timestamp), 'HH:mm');
    };

    const getContactDisplayName = (contact) => {
        return `${contact.first_name} ${contact.last_name} (${contact.email})`;
    };

    return (
        <Box sx={{ height: 'calc(100vh - 64px)', p: 2 }}>
            <Grid container spacing={2} sx={{ height: '100%' }}>
                {/* Contacts List */}
                <Grid item xs={12} md={4}>
                    <Paper sx={{ height: '100%', overflow: 'auto' }}>
                        <List>
                            {contacts.map((contact) => (
                                <ListItem
                                    key={contact.id}
                                    button
                                    selected={selectedContact?.id === contact.id}
                                    onClick={() => setSelectedContact(contact)}
                                >
                                    <ListItemAvatar>
                                        <Avatar>
                                            <PersonIcon />
                                        </Avatar>
                                    </ListItemAvatar>
                                    <ListItemText
                                        primary={getContactDisplayName(contact)}
                                        secondary={
                                            <>
                                                <Typography component="span" variant="body2" color="text.primary">
                                                    {contact.role}
                                                </Typography>
                                                {contact.last_message && (
                                                    <Typography component="span" variant="body2" color="text.secondary">
                                                        {' - '}{contact.last_message.message}
                                                    </Typography>
                                                )}
                                            </>
                                        }
                                    />
                                    {contact.unread_count > 0 && (
                                        <Badge badgeContent={contact.unread_count} color="primary" />
                                    )}
                                </ListItem>
                            ))}
                        </List>
                    </Paper>
                </Grid>

                {/* Chat Area */}
                <Grid item xs={12} md={8}>
                    <Paper sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                        {selectedContact ? (
                            <>
                                {/* Chat Header */}
                                <Box sx={{ p: 2, borderBottom: 1, borderColor: 'divider' }}>
                                    <Typography variant="h6">
                                        {getContactDisplayName(selectedContact)}
                                    </Typography>
                                </Box>

                                {/* Messages */}
                                <Box sx={{ flexGrow: 1, overflow: 'auto', p: 2 }}>
                                    {loading ? (
                                        <Box display="flex" justifyContent="center" alignItems="center" height="100%">
                                            <CircularProgress />
                                        </Box>
                                    ) : error ? (
                                        <Alert severity="error">{error}</Alert>
                                    ) : (
                                        messages.map((message) => (
                                            <Box
                                                key={message.id}
                                                sx={{
                                                    display: 'flex',
                                                    justifyContent: message.sender_id === user.id ? 'flex-end' : 'flex-start',
                                                    mb: 2
                                                }}
                                            >
                                                <Box
                                                    sx={{
                                                        maxWidth: '70%',
                                                        backgroundColor: message.sender_id === user.id ? 'primary.main' : 'grey.200',
                                                        color: message.sender_id === user.id ? 'white' : 'text.primary',
                                                        borderRadius: 2,
                                                        p: 2
                                                    }}
                                                >
                                                    <Typography variant="body1">{message.message}</Typography>
                                                    <Typography variant="caption" sx={{ display: 'block', mt: 0.5 }}>
                                                        {formatMessageTime(message.timestamp)}
                                                    </Typography>
                                                </Box>
                                            </Box>
                                        ))
                                    )}
                                    <div ref={messagesEndRef} />
                                </Box>

                                {/* Message Input */}
                                <Box sx={{ p: 2, borderTop: 1, borderColor: 'divider' }}>
                                    <form onSubmit={handleSendMessage}>
                                        <Box sx={{ display: 'flex', gap: 1 }}>
                                            <TextField
                                                fullWidth
                                                variant="outlined"
                                                placeholder="Type a message"
                                                value={newMessage}
                                                onChange={(e) => setNewMessage(e.target.value)}
                                            />
                                            <IconButton type="submit" color="primary" disabled={!newMessage.trim()}>
                                                <SendIcon />
                                            </IconButton>
                                        </Box>
                                    </form>
                                </Box>
                            </>
                        ) : (
                            <Box display="flex" justifyContent="center" alignItems="center" height="100%">
                                <Typography variant="h6" color="text.secondary">
                                    Select a contact to start chatting
                                </Typography>
                            </Box>
                        )}
                    </Paper>
                </Grid>
            </Grid>

            {/* Notification Badge */}
            {notificationCount > 0 && (
                <Tooltip title={`${notificationCount} unread messages`}>
                    <Badge
                        badgeContent={notificationCount}
                        color="primary"
                        sx={{
                            position: 'fixed',
                            bottom: 20,
                            right: 20,
                            cursor: 'pointer'
                        }}
                    >
                        <NotificationsIcon />
                    </Badge>
                </Tooltip>
            )}
        </Box>
    );
};

export default Chat; 