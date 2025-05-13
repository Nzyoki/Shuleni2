import React from 'react';
import {
    Container,
    Paper,
    Typography,
    Box,
    Card,
    CardContent,
    Grid,
    Avatar,
    Chip,
} from '@mui/material';
import {
    Message as MessageIcon,
    Group as GroupIcon,
    Forum as ForumIcon,
    Chat as ChatIcon,
} from '@mui/icons-material';

const Chat = () => {
    const features = [
        {
            icon: <MessageIcon />,
            title: 'Direct Messaging',
            description: 'Send private messages to teachers, students, and administrators',
            status: 'Coming Soon'
        },
        {
            icon: <GroupIcon />,
            title: 'Group Chats',
            description: 'Create and participate in class-specific group discussions',
            status: 'Coming Soon'
        },
        {
            icon: <ForumIcon />,
            title: 'Discussion Forums',
            description: 'Engage in topic-based discussions and academic debates',
            status: 'Coming Soon'
        },
        {
            icon: <ChatIcon />,
            title: 'Real-time Chat',
            description: 'Instant messaging with real-time notifications and updates',
            status: 'Coming Soon'
        }
    ];

    return (
        <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
            <Paper sx={{ p: 4, borderRadius: 2 }}>
                <Box sx={{ textAlign: 'center', mb: 6 }}>
                    <Typography variant="h3" component="h1" gutterBottom>
                        Chat Features Coming Soon
                    </Typography>
                </Box>

                <Grid container spacing={4}>
                    {features.map((feature, index) => (
                        <Grid item xs={12} sm={6} key={index}>
                            <Card
                                sx={{
                                    height: '100%',
                                    display: 'flex',
                                    flexDirection: 'column',
                                    transition: 'transform 0.2s, box-shadow 0.2s',
                                    '&:hover': {
                                        transform: 'translateY(-4px)',
                                        boxShadow: 4,
                                    }
                                }}
                            >
                                <CardContent>
                                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                                        <Avatar
                                            sx={{
                                                bgcolor: 'primary.main',
                                                width: 56,
                                                height: 56,
                                                mr: 2
                                            }}
                                        >
                                            {feature.icon}
                                        </Avatar>
                                        <Box>
                                            <Typography variant="h6" gutterBottom>
                                                {feature.title}
                                            </Typography>
                                            <Chip
                                                label={feature.status}
                                                color="primary"
                                                size="small"
                                            />
                                        </Box>
                                    </Box>
                                    <Typography variant="body1" color="text.secondary">
                                        {feature.description}
                                    </Typography>
                                </CardContent>
                            </Card>
                        </Grid>
                    ))}
                </Grid>
            </Paper>
        </Container>
    );
};

export default Chat; 