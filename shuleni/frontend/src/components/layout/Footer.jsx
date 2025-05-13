import React from 'react';
import { Box, Container, Grid, Typography, IconButton, Link } from '@mui/material';
import { Facebook, Twitter, LinkedIn, Instagram, Email, Phone, LocationOn } from '@mui/icons-material';

const Footer = () => {
    return (
        <Box
            sx={{
                bgcolor: '#FFDAB9',
                color: '#8B4513',
                py: 6,
                borderTop: '1px solid #D2B48C',
                mt: 'auto'
            }}
        >
            <Container maxWidth="lg">
                <Grid container spacing={4}>
                    <Grid item xs={12} sm={4}>
                        <Typography variant="h6" gutterBottom sx={{ fontWeight: 'bold' }}>
                            About Shuleni
                        </Typography>
                        <Typography variant="body2">
                            Empowering education through innovative technology.
                            Our platform connects schools, teachers, and students
                            for a seamless learning experience.
                        </Typography>
                        <Box sx={{ mt: 2 }}>
                            <IconButton color="inherit" aria-label="Facebook">
                                <Facebook />
                            </IconButton>
                            <IconButton color="inherit" aria-label="Twitter">
                                <Twitter />
                            </IconButton>
                            <IconButton color="inherit" aria-label="LinkedIn">
                                <LinkedIn />
                            </IconButton>
                            <IconButton color="inherit" aria-label="Instagram">
                                <Instagram />
                            </IconButton>
                        </Box>
                    </Grid>
                    <Grid item xs={12} sm={4}>
                        <Typography variant="h6" gutterBottom sx={{ fontWeight: 'bold' }}>
                            Quick Links
                        </Typography>
                        <Link href="/dashboard" color="inherit" display="block" sx={{ mb: 1 }}>
                            Dashboard
                        </Link>
                        <Link href="/resources" color="inherit" display="block" sx={{ mb: 1 }}>
                            Resources
                        </Link>
                        <Link href="/assessments" color="inherit" display="block" sx={{ mb: 1 }}>
                            Assessments
                        </Link>
                        <Link href="/chat" color="inherit" display="block" sx={{ mb: 1 }}>
                            Chat
                        </Link>
                    </Grid>
                    <Grid item xs={12} sm={4}>
                        <Typography variant="h6" gutterBottom sx={{ fontWeight: 'bold' }}>
                            Contact Us
                        </Typography>
                        <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                            <Email sx={{ mr: 1 }} />
                            <Typography variant="body2">
                                support@shuleni.com
                            </Typography>
                        </Box>
                        <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                            <Phone sx={{ mr: 1 }} />
                            <Typography variant="body2">
                                +254 700 000 000
                            </Typography>
                        </Box>
                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                            <LocationOn sx={{ mr: 1 }} />
                            <Typography variant="body2">
                                Nairobi, Kenya
                            </Typography>
                        </Box>
                    </Grid>
                </Grid>
                <Box sx={{ mt: 4, borderTop: '1px solid #D2B48C', pt: 2 }}>
                    <Typography variant="body2" align="center">
                        © {new Date().getFullYear()} Shuleni. All rights reserved.
                    </Typography>
                </Box>
            </Container>
        </Box>
    );
};

export default Footer; 