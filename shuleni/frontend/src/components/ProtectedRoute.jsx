import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import {
    Box,
    Typography,
    Button,
    Paper,
    Container,
} from '@mui/material';
import { Error as ErrorIcon } from '@mui/icons-material';

const ProtectedRoute = ({ children, requiredPermissions = [] }) => {
    const { user, isAuthenticated, hasPermission } = useAuth();
    const location = useLocation();

    if (!isAuthenticated) {
        return <Navigate to="/login" state={{ from: location }} replace />;
    }

    if (requiredPermissions.length > 0) {
        const hasRequiredPermissions = requiredPermissions.every(permission =>
            hasPermission(permission)
        );

        if (!hasRequiredPermissions) {
            return (
                <Container maxWidth="sm">
                    <Box
                        sx={{
                            minHeight: '100vh',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            py: 4
                        }}
                    >
                        <Paper
                            elevation={3}
                            sx={{
                                p: 4,
                                display: 'flex',
                                flexDirection: 'column',
                                alignItems: 'center',
                                textAlign: 'center'
                            }}
                        >
                            <ErrorIcon
                                color="error"
                                sx={{ fontSize: 60, mb: 2 }}
                            />
                            <Typography
                                variant="h4"
                                component="h1"
                                color="error"
                                gutterBottom
                            >
                                Access Denied
                            </Typography>
                            <Typography
                                variant="body1"
                                color="text.secondary"
                                paragraph
                            >
                                You don't have permission to access this page. Please contact your administrator if you believe this is an error.
                            </Typography>
                            <Button
                                variant="contained"
                                color="primary"
                                onClick={() => window.history.back()}
                                sx={{ mt: 2 }}
                            >
                                Go Back
                            </Button>
                        </Paper>
                    </Box>
                </Container>
            );
        }
    }

    return children;
};

export default ProtectedRoute; 