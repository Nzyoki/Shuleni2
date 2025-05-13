import React from 'react';
import { Box, Typography, Paper } from '@mui/material';
import { Chat as ChatIcon } from '@mui/icons-material';

const Chat = () => {
    return (
        <Box
            sx={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                minHeight: '60vh',
                p: 3
            }}
        >
            <Paper
                elevation={3}
                sx={{
                    p: 4,
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    bgcolor: 'var(--color-peach)',
                    border: '1px solid var(--color-tan)',
                    maxWidth: 600,
                    width: '100%'
                }}
            >
                <ChatIcon
                    sx={{
                        fontSize: 80,
                        color: 'var(--color-brown)',
                        mb: 2
                    }}
                />
                <Typography
                    variant="h4"
                    component="h1"
                    gutterBottom
                    sx={{
                        color: 'var(--color-brown)',
                        fontWeight: 'bold',
                        textAlign: 'center'
                    }}
                >
                    Chat Feature
                </Typography>
                <Typography
                    variant="h5"
                    sx={{
                        color: 'var(--color-brown)',
                        textAlign: 'center',
                        fontStyle: 'italic'
                    }}
                >
                    To be implemented in the future
                </Typography>
                <Typography
                    variant="body1"
                    sx={{
                        mt: 2,
                        color: 'var(--color-brown)',
                        textAlign: 'center'
                    }}
                >
                    This feature will enable real-time communication between teachers and students,
                    facilitating seamless collaboration and support within the platform.
                </Typography>
            </Paper>
        </Box>
    );
};

export default Chat; 