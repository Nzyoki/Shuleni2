import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { getPublicSchools } from '../services/schools';
import {
    Container,
    Paper,
    TextField,
    Button,
    Typography,
    Box,
    MenuItem,
    Select,
    InputLabel,
    FormControl,
    Alert,
    CircularProgress
} from '@mui/material';

const Register = () => {
    const navigate = useNavigate();
    const { register } = useAuth();
    const [schools, setSchools] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [formData, setFormData] = useState({
        email: '',
        password: '',
        confirmPassword: '',
        first_name: '',
        last_name: '',
        role: 'student',
        school_id: ''
    });

    useEffect(() => {
        const fetchSchools = async () => {
            try {
                const response = await getPublicSchools();
                console.log('Fetched schools for registration:', response);
                setSchools(response);
            } catch (err) {
                console.error('Error fetching schools:', err);
            }
        };
        fetchSchools();
    }, []);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        if (formData.password !== formData.confirmPassword) {
            setError('Passwords do not match');
            setLoading(false);
            return;
        }

        try {
            const userData = {
                ...formData,
                school_id: formData.role === 'super_admin' ? null : parseInt(formData.school_id)
            };
            await register(userData);
            navigate('/dashboard');
        } catch (err) {
            setError(err.message || 'Registration failed');
            console.error('Registration error:', err);
        } finally {
            setLoading(false);
        }
    };

    return (
        <Container component="main" maxWidth="xs">
            <Box
                sx={{
                    marginTop: 8,
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                }}
            >
                <Paper
                    elevation={3}
                    sx={{
                        padding: 4,
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        width: '100%',
                    }}
                >
                    <Typography component="h1" variant="h5">
                        Create your account
                    </Typography>
                    <Typography sx={{ mt: 1, mb: 2 }} variant="body2">
                        Or{' '}
                        <Link to="/login" style={{ color: '#6366f1', textDecoration: 'underline' }}>
                            sign in to your existing account
                        </Link>
                    </Typography>
                    {error && (
                        <Alert severity="error" sx={{ mt: 2, width: '100%' }}>
                            {error}
                        </Alert>
                    )}
                    <Box component="form" onSubmit={handleSubmit} sx={{ mt: 1, width: '100%' }}>
                        <Box sx={{ display: 'flex', gap: 2 }}>
                            <TextField
                                margin="normal"
                                required
                                fullWidth
                                id="first_name"
                                label="First Name"
                                name="first_name"
                                autoComplete="given-name"
                                value={formData.first_name}
                                onChange={handleChange}
                            />
                            <TextField
                                margin="normal"
                                required
                                fullWidth
                                id="last_name"
                                label="Last Name"
                                name="last_name"
                                autoComplete="family-name"
                                value={formData.last_name}
                                onChange={handleChange}
                            />
                        </Box>
                        <TextField
                            margin="normal"
                            required
                            fullWidth
                            id="email"
                            label="Email Address"
                            name="email"
                            autoComplete="email"
                            value={formData.email}
                            onChange={handleChange}
                        />
                        <FormControl fullWidth margin="normal">
                            <InputLabel id="role-label">Role</InputLabel>
                            <Select
                                labelId="role-label"
                                id="role"
                                name="role"
                                value={formData.role}
                                label="Role"
                                onChange={handleChange}
                                required
                            >
                                <MenuItem value="super_admin">Super Admin</MenuItem>
                                <MenuItem value="school_admin">School Admin</MenuItem>
                                <MenuItem value="teacher">Teacher</MenuItem>
                                <MenuItem value="student">Student</MenuItem>
                            </Select>
                        </FormControl>
                        {formData.role !== 'super_admin' && (
                            <FormControl fullWidth margin="normal">
                                <InputLabel id="school-label">School</InputLabel>
                                <Select
                                    labelId="school-label"
                                    id="school_id"
                                    name="school_id"
                                    value={formData.school_id}
                                    label="School"
                                    onChange={handleChange}
                                    required
                                >
                                    <MenuItem value="">Select a school</MenuItem>
                                    {schools.map(school => (
                                        <MenuItem key={school.id} value={school.id}>
                                            {school.name}
                                        </MenuItem>
                                    ))}
                                </Select>
                            </FormControl>
                        )}
                        <TextField
                            margin="normal"
                            required
                            fullWidth
                            name="password"
                            label="Password"
                            type="password"
                            id="password"
                            autoComplete="new-password"
                            value={formData.password}
                            onChange={handleChange}
                        />
                        <TextField
                            margin="normal"
                            required
                            fullWidth
                            name="confirmPassword"
                            label="Confirm Password"
                            type="password"
                            id="confirmPassword"
                            autoComplete="new-password"
                            value={formData.confirmPassword}
                            onChange={handleChange}
                        />
                        <Button
                            type="submit"
                            fullWidth
                            variant="contained"
                            sx={{ mt: 3, mb: 2 }}
                            disabled={loading}
                        >
                            {loading ? <CircularProgress size={24} color="inherit" /> : 'Register'}
                        </Button>
                    </Box>
                </Paper>
            </Box>
        </Container>
    );
};

export default Register; 