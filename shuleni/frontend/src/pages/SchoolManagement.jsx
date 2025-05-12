import React, { useState, useEffect } from 'react';
import {
    Box,
    Button,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    TextField,
    Paper,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    IconButton,
    Typography,
    Alert,
    CircularProgress,
    Snackbar,
    Tooltip,
} from '@mui/material';
import {
    Edit as EditIcon,
    Delete as DeleteIcon,
    Add as AddIcon,
    Refresh as RefreshIcon,
} from '@mui/icons-material';
import { getSchools, createSchool, updateSchool, deleteSchool } from '../services/schools';
import { useAuth } from '../contexts/AuthContext';

const SchoolManagement = () => {
    const [schools, setSchools] = useState([]);
    const [open, setOpen] = useState(false);
    const [editingSchool, setEditingSchool] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [successMessage, setSuccessMessage] = useState('');
    const { user } = useAuth();
    const [formData, setFormData] = useState({
        name: '',
        description: '',
        address: '',
    });

    useEffect(() => {
        fetchSchools();
    }, []);

    const fetchSchools = async () => {
        try {
            setLoading(true);
            setError('');
            const response = await getSchools();
            if (Array.isArray(response)) {
                setSchools(response);
            } else {
                setError('Invalid schools data format');
            }
        } catch (error) {
            setError(error.message || 'Failed to fetch schools');
        } finally {
            setLoading(false);
        }
    };

    const handleOpen = (school = null) => {
        if (school) {
            setEditingSchool(school);
            setFormData({
                name: school.name,
                description: school.description || '',
                address: school.address || '',
            });
        } else {
            setEditingSchool(null);
            setFormData({
                name: '',
                description: '',
                address: '',
            });
        }
        setOpen(true);
    };

    const handleClose = () => {
        setOpen(false);
        setEditingSchool(null);
        setFormData({
            name: '',
            description: '',
            address: '',
        });
    };

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value,
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            setError('');
            if (editingSchool) {
                await updateSchool(editingSchool.id, formData);
                setSuccessMessage('School updated successfully');
            } else {
                await createSchool(formData);
                setSuccessMessage('School created successfully');
            }
            handleClose();
            fetchSchools();
        } catch (error) {
            setError(error.message || 'Failed to save school');
        }
    };

    const handleDelete = async (id) => {
        if (window.confirm('Are you sure you want to delete this school? This action cannot be undone.')) {
            try {
                setError('');
                await deleteSchool(id);
                setSuccessMessage('School deleted successfully');
                fetchSchools();
            } catch (error) {
                setError(error.message || 'Failed to delete school');
            }
        }
    };

    if (loading) {
        return (
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
                <CircularProgress />
            </Box>
        );
    }

    return (
        <Box sx={{ p: 3 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                <Typography variant="h4" component="h1" sx={{ fontWeight: 'bold' }}>
                    School Management
                </Typography>
                <Box>
                    <Tooltip title="Refresh">
                        <IconButton onClick={fetchSchools} sx={{ mr: 1 }}>
                            <RefreshIcon />
                        </IconButton>
                    </Tooltip>
                    <Button
                        variant="contained"
                        startIcon={<AddIcon />}
                        onClick={() => handleOpen()}
                        sx={{
                            backgroundColor: 'primary.main',
                            '&:hover': {
                                backgroundColor: 'primary.dark',
                            },
                        }}
                    >
                        Add School
                    </Button>
                </Box>
            </Box>

            {error && (
                <Alert severity="error" sx={{ mb: 2 }}>
                    {error}
                </Alert>
            )}

            <Snackbar
                open={!!successMessage}
                autoHideDuration={6000}
                onClose={() => setSuccessMessage('')}
                anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
            >
                <Alert onClose={() => setSuccessMessage('')} severity="success" sx={{ width: '100%' }}>
                    {successMessage}
                </Alert>
            </Snackbar>

            <TableContainer component={Paper} sx={{ boxShadow: 3 }}>
                <Table>
                    <TableHead>
                        <TableRow sx={{ backgroundColor: 'primary.light' }}>
                            <TableCell sx={{ fontWeight: 'bold' }}>Name</TableCell>
                            <TableCell sx={{ fontWeight: 'bold' }}>Description</TableCell>
                            <TableCell sx={{ fontWeight: 'bold' }}>Address</TableCell>
                            <TableCell sx={{ fontWeight: 'bold' }}>Actions</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {schools.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={4} align="center" sx={{ py: 3 }}>
                                    <Typography variant="body1" color="text.secondary">
                                        No schools found
                                    </Typography>
                                </TableCell>
                            </TableRow>
                        ) : (
                            schools.map((school) => (
                                <TableRow key={school.id} hover>
                                    <TableCell>{school.name}</TableCell>
                                    <TableCell>{school.description}</TableCell>
                                    <TableCell>{school.address}</TableCell>
                                    <TableCell>
                                        <Tooltip title="Edit">
                                            <IconButton
                                                color="primary"
                                                onClick={() => handleOpen(school)}
                                                sx={{ mr: 1 }}
                                            >
                                                <EditIcon />
                                            </IconButton>
                                        </Tooltip>
                                        <Tooltip title="Delete">
                                            <IconButton
                                                color="error"
                                                onClick={() => handleDelete(school.id)}
                                            >
                                                <DeleteIcon />
                                            </IconButton>
                                        </Tooltip>
                                    </TableCell>
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>
            </TableContainer>

            <Dialog
                open={open}
                onClose={handleClose}
                maxWidth="sm"
                fullWidth
            >
                <DialogTitle>
                    {editingSchool ? 'Edit School' : 'Add New School'}
                </DialogTitle>
                <DialogContent>
                    <Box component="form" onSubmit={handleSubmit} sx={{ mt: 2 }}>
                        <TextField
                            fullWidth
                            label="School Name"
                            name="name"
                            value={formData.name}
                            onChange={handleChange}
                            margin="normal"
                            required
                            autoFocus
                        />
                        <TextField
                            fullWidth
                            label="Description"
                            name="description"
                            value={formData.description}
                            onChange={handleChange}
                            margin="normal"
                            multiline
                            rows={3}
                        />
                        <TextField
                            fullWidth
                            label="Address"
                            name="address"
                            value={formData.address}
                            onChange={handleChange}
                            margin="normal"
                        />
                    </Box>
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleClose}>Cancel</Button>
                    <Button
                        onClick={handleSubmit}
                        variant="contained"
                        sx={{
                            backgroundColor: 'primary.main',
                            '&:hover': {
                                backgroundColor: 'primary.dark',
                            },
                        }}
                    >
                        {editingSchool ? 'Update' : 'Add'}
                    </Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
};

export default SchoolManagement; 