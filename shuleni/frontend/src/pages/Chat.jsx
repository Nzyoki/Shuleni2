import React, { useState, useEffect } from 'react';
import {
    Box,
    Paper,
    Typography,
    TextField,
    Button,
    List,
    ListItem,
    ListItemText,
    Divider,
    Container,
    Grid
} from '@mui/material';
import { useAuth } from '../contexts/AuthContext';
import { io } from 'socket.io-client';

const Chat = () => {
    const { user } = useAuth();
    const [messages, setMessages] = useState([]);
    const [newMessage, setNewMessage] = useState('');
    const [socket, setSocket] = useState(null);

    useEffect(() => {
        // Connect to the WebSocket server
        const newSocket = io('http://localhost:5000', {
            auth: {
                token: localStorage.getItem('token')
            }
        });

        setSocket(newSocket);

        // Listen for incoming messages
        newSocket.on('message', (message) => {
            setMessages(prevMessages => [...prevMessages, message]);
        });

        // Cleanup on unmount
        return () => newSocket.close();
    }, []);

    const handleSendMessage = (e) => {
        e.preventDefault();
        if (newMessage.trim() && socket) {
            const messageData = {
                content: newMessage,
                sender: user.id,
                senderName: `${user.first_name} ${user.last_name}`,
                timestamp: new Date().toISOString()
            };

            // Emit the message to the server
            socket.emit('message', messageData);
            setNewMessage('');
        }
    };

    return (
        <Container>
            <Paper elevation={3} sx={{ p: 3, mt: 3 }}>
                <Typography variant="h4" gutterBottom>
                    School Chat
                </Typography>
                <Grid container spacing={3}>
                    <Grid item xs={12}>
                        <Box sx={{ height: '60vh', overflow: 'auto' }}>
                            <List>
                                {messages.map((message, index) => (
                                    <React.Fragment key={index}>
                                        <ListItem alignItems="flex-start">
                                            <ListItemText
                                                primary={message.senderName}
                                                secondary={
                                                    <>
                                                        <Typography
                                                            component="span"
                                                            variant="body2"
                                                            color="text.primary"
                                                        >
                                                            {message.content}
                                                        </Typography>
                                                        <br />
                                                        <Typography
                                                            component="span"
                                                            variant="caption"
                                                            color="text.secondary"
                                                        >
                                                            {new Date(message.timestamp).toLocaleString()}
                                                        </Typography>
                                                    </>
                                                }
                                            />
                                        </ListItem>
                                        <Divider variant="inset" component="li" />
                                    </React.Fragment>
                                ))}
                            </List>
                        </Box>
                        <Box component="form" onSubmit={handleSendMessage} sx={{ mt: 2 }}>
                            <Grid container spacing={2}>
                                <Grid item xs={10}>
                                    <TextField
                                        fullWidth
                                        variant="outlined"
                                        placeholder="Type your message..."
                                        value={newMessage}
                                        onChange={(e) => setNewMessage(e.target.value)}
                                    />
                                </Grid>
                                <Grid item xs={2}>
                                    <Button
                                        fullWidth
                                        variant="contained"
                                        color="primary"
                                        type="submit"
                                        sx={{ height: '100%' }}
                                    >
                                        Send
                                    </Button>
                                </Grid>
                            </Grid>
                        </Box>
                    </Grid>
                </Grid>
            </Paper>
        </Container>
    );
};

export default Chat; 