import React from 'react';
import { Box, Container, Typography, Link, Grid } from '@mui/material';
import { Email, Phone, LocationOn } from '@mui/icons-material';

const Footer = () => {
    return (
        <Box
            component="footer"
            sx={{
                backgroundColor: '#FFDAB9', // Peach color
                py: 3,
                position: 'fixed',
                bottom: 0,
                width: '100%',
                borderTop: '2px solid #D2B48C', // Tan color border
            }}
        >
            <Container maxWidth="lg">
                <Grid container spacing={3}>
                    <Grid item xs={12} md={4}>
                        <Typography variant="body2" color="#8B4513">
                            © {new Date().getFullYear()} Shuleni School Management System. All rights reserved.
                        </Typography>
                    </Grid>
                    <Grid item xs={12} md={4}>
                        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: { xs: 'flex-start', md: 'center' } }}>
                            <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                                <Email sx={{ color: '#8B4513', mr: 1, fontSize: 20 }} />
                                <Typography variant="body2" color="#8B4513">
                                    info@shuleni.com
                                </Typography>
                            </Box>
                            <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                                <Phone sx={{ color: '#8B4513', mr: 1, fontSize: 20 }} />
                                <Typography variant="body2" color="#8B4513">
                                    +254 700 000 000
                                </Typography>
                            </Box>
                            <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                <LocationOn sx={{ color: '#8B4513', mr: 1, fontSize: 20 }} />
                                <Typography variant="body2" color="#8B4513">
                                    Nairobi, Kenya
                                </Typography>
                            </Box>
                        </Box>
                    </Grid>
                    <Grid item xs={12} md={4}>
                        <Box sx={{ display: 'flex', justifyContent: { xs: 'flex-start', md: 'flex-end' } }}>
                            <Link
                                href="#"
                                sx={{
                                    color: '#8B4513',
                                    mx: 1.5,
                                    '&:hover': {
                                        color: '#D2B48C',
                                    },
                                }}
                            >
                                Privacy Policy
                            </Link>
                            <Link
                                href="#"
                                sx={{
                                    color: '#8B4513',
                                    mx: 1.5,
                                    '&:hover': {
                                        color: '#D2B48C',
                                    },
                                }}
                            >
                                Terms of Service
                            </Link>
                        </Box>
                    </Grid>
                </Grid>
            </Container>
        </Box>
    );
};

export default Footer; 