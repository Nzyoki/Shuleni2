import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { getClasses, createClass, updateClass, deleteClass } from '../services/classes';
import { getSchools } from '../services/schools';
import { getUsers } from '../services/users';
import {
    Container,
    Typography,
    Box,
    Paper,
    Button,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    CircularProgress,
    Dialog,
    DialogActions,
    DialogContent,
    DialogContentText,
    DialogTitle,
    TextField,
    FormControl,
    InputLabel,
    MenuItem,
    Select,
    Alert,
    IconButton,
    Tooltip
} from '@mui/material';
import {
    Add as AddIcon,
    Edit as EditIcon,
    Delete as DeleteIcon,
    Refresh as RefreshIcon
} from '@mui/icons-material';

const ClassManagement = () => {
    const { user } = useAuth();
    const [classes, setClasses] = useState([]);
    const [schools, setSchools] = useState([]);
    const [teachers, setTeachers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    // Dialog states
    const [openCreateDialog, setOpenCreateDialog] = useState(false);
    const [openEditDialog, setOpenEditDialog] = useState(false);
    const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
    const [currentClass, setCurrentClass] = useState(null);

    // Form data
    const [formData, setFormData] = useState({
        name: '',
        description: '',
        school_id: '',
        teacher_id: ''
    });

    const fetchData = useCallback(async () => {
        setLoading(true);
        setError('');

        try {
            // Fetch classes
            const classesData = await getClasses();
            setClasses(classesData);

            // Fetch schools if super admin
            if (user.role === 'super_admin') {
                const schoolsData = await getSchools();
                setSchools(schoolsData);
            }

            // Fetch teachers
            const usersData = await getUsers({ role: 'teacher', school_id: user.school_id });
            setTeachers(usersData);
        } catch (err) {
            setError(`Failed to load data: ${err.message || 'Unknown error'}`);
            console.error(err);
        } finally {
            setLoading(false);
        }
    }, [user]);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    const handleOpenCreateDialog = () => {
        // Initialize with defaults for school_admin
        setFormData({
            name: '',
            description: '',
            school_id: user.role === 'school_admin' ? user.school_id : '',
            teacher_id: user.role === 'teacher' ? user.id : ''
        });
        setOpenCreateDialog(true);
    };

    const handleOpenEditDialog = (classItem) => {
        setCurrentClass(classItem);
        setFormData({
            name: classItem.name,
            description: classItem.description || '',
            school_id: classItem.school_id || '',
            teacher_id: classItem.teacher_id || ''
        });
        setOpenEditDialog(true);
    };

    const handleOpenDeleteDialog = (classItem) => {
        setCurrentClass(classItem);
        setOpenDeleteDialog(true);
    };

    const handleFormChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleCreate = async () => {
        setLoading(true);
        try {
            const data = { ...formData };

            // Ensure school_id for school_admin
            if (user.role === 'school_admin') {
                data.school_id = user.school_id;
            }

            // Convert IDs to numbers
            if (data.school_id) data.school_id = parseInt(data.school_id);
            if (data.teacher_id) data.teacher_id = parseInt(data.teacher_id);

            await createClass(data);
            setOpenCreateDialog(false);
            setSuccess('Class created successfully');
            fetchData();

            // Clear success message after 3 seconds
            setTimeout(() => setSuccess(''), 3000);
        } catch (err) {
            setError(`Failed to create class: ${err.message || 'Unknown error'}`);
        } finally {
            setLoading(false);
        }
    };

    const handleUpdate = async () => {
        if (!currentClass) return;

        setLoading(true);
        try {
            const data = { ...formData };

            // Convert IDs to numbers
            if (data.school_id) data.school_id = parseInt(data.school_id);
            if (data.teacher_id) data.teacher_id = parseInt(data.teacher_id);

            await updateClass(currentClass.id, data);
            setOpenEditDialog(false);
            setSuccess('Class updated successfully');
            fetchData();

            // Clear success message after 3 seconds
            setTimeout(() => setSuccess(''), 3000);
        } catch (err) {
            setError(`Failed to update class: ${err.message || 'Unknown error'}`);
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async () => {
        if (!currentClass) return;

        setLoading(true);
        try {
            await deleteClass(currentClass.id);
            setOpenDeleteDialog(false);
            setSuccess('Class deleted successfully');
            fetchData();

            // Clear success message after 3 seconds
            setTimeout(() => setSuccess(''), 3000);
        } catch (err) {
            setError(`Failed to delete class: ${err.message || 'Unknown error'}`);
        } finally {
        setLoading(false);
        }
    };

    // Helper to get school name
    const getSchoolName = (schoolId) => {
        if (!schoolId) return 'N/A';
        const school = schools.find(s => s.id === schoolId);
        return school ? school.name : 'Unknown';
    };

    // Helper to get teacher name
    const getTeacherName = (teacherId) => {
        if (!teacherId) return 'Not assigned';
        const teacher = teachers.find(t => t.id === teacherId);
        return teacher ? `${teacher.first_name} ${teacher.last_name}` : 'Unknown';
    };

    if (loading && classes.length === 0) {
        return (
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '70vh' }}>
                <CircularProgress />
            </Box>
        );
    }

    return (
        <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
            <Paper sx={{ p: 3 }}>
                <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
                    <Typography variant="h4" component="h1">
                        Class Management
                    </Typography>
                    <Box>
                        {user.role !== 'student' && (
                            <Button
                                variant="contained"
                                color="primary"
                                startIcon={<AddIcon />}
                                onClick={handleOpenCreateDialog}
                                sx={{ mr: 1 }}
                >
                    Add Class
                            </Button>
                        )}
                        <IconButton
                            color="primary"
                            onClick={fetchData}
                            disabled={loading}
                        >
                            <RefreshIcon />
                        </IconButton>
                    </Box>
                </Box>

            {error && (
                    <Alert severity="error" sx={{ mb: 3 }}>
                        {error}
                    </Alert>
            )}

                {success && (
                    <Alert severity="success" sx={{ mb: 3 }}>
                        {success}
                    </Alert>
                )}

                <TableContainer>
                    <Table>
                        <TableHead>
                            <TableRow>
                                <TableCell>Class Name</TableCell>
                                {user.role === 'super_admin' && <TableCell>School</TableCell>}
                                <TableCell>Teacher</TableCell>
                                <TableCell>Description</TableCell>
                                <TableCell>Actions</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {loading ? (
                                <TableRow>
                                    <TableCell colSpan={user.role === 'super_admin' ? 5 : 4} align="center">
                                        <CircularProgress size={24} />
                                    </TableCell>
                                </TableRow>
                            ) : classes.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={user.role === 'super_admin' ? 5 : 4} align="center">
                                    No classes found
                                    </TableCell>
                                </TableRow>
                        ) : (
                            classes.map((classItem) => (
                                    <TableRow key={classItem.id}>
                                        <TableCell>
                                            <Typography variant="body1" fontWeight="medium">
                                                {classItem.name}
                                            </Typography>
                                        </TableCell>
                                        {user.role === 'super_admin' && (
                                            <TableCell>{getSchoolName(classItem.school_id)}</TableCell>
                                        )}
                                        <TableCell>{getTeacherName(classItem.teacher_id)}</TableCell>
                                        <TableCell>{classItem.description || 'No description'}</TableCell>
                                        <TableCell>
                                            {user.role !== 'student' && (
                                                <>
                                                    <Tooltip title="Edit">
                                                        <IconButton
                                                            color="primary"
                                                            onClick={() => handleOpenEditDialog(classItem)}
                                                        >
                                                            <EditIcon />
                                                        </IconButton>
                                                    </Tooltip>
                                                    <Tooltip title="Delete">
                                                        <IconButton
                                                            color="error"
                                                            onClick={() => handleOpenDeleteDialog(classItem)}
                                                        >
                                                            <DeleteIcon />
                                                        </IconButton>
                                                    </Tooltip>
                                                </>
                                            )}
                                        </TableCell>
                                    </TableRow>
                                ))
                            )}
                        </TableBody>
                    </Table>
                </TableContainer>
            </Paper>

            {/* Create Class Dialog */}
            <Dialog open={openCreateDialog} onClose={() => setOpenCreateDialog(false)}>
                <DialogTitle>Create New Class</DialogTitle>
                <DialogContent>
                    <TextField
                        margin="normal"
                        required
                        fullWidth
                        id="name"
                        label="Class Name"
                        name="name"
                        value={formData.name}
                        onChange={handleFormChange}
                    />
                    <TextField
                        margin="normal"
                        fullWidth
                        id="description"
                        label="Description"
                        name="description"
                        multiline
                        rows={3}
                        value={formData.description}
                        onChange={handleFormChange}
                    />
                    {user.role === 'super_admin' && (
                        <FormControl fullWidth margin="normal">
                            <InputLabel>School</InputLabel>
                            <Select
                                id="school_id"
                                name="school_id"
                                value={formData.school_id}
                                label="School"
                                onChange={handleFormChange}
                                required
                            >
                                <MenuItem value="">
                                    <em>Select a school</em>
                                </MenuItem>
                                {schools.map(school => (
                                    <MenuItem key={school.id} value={school.id}>
                                        {school.name}
                                    </MenuItem>
                                ))}
                            </Select>
                        </FormControl>
                    )}
                    <FormControl fullWidth margin="normal">
                        <InputLabel>Teacher</InputLabel>
                        <Select
                            id="teacher_id"
                            name="teacher_id"
                            value={formData.teacher_id}
                            label="Teacher"
                            onChange={handleFormChange}
                        >
                            <MenuItem value="">
                                <em>Assign later</em>
                            </MenuItem>
                            {teachers.map(teacher => (
                                <MenuItem key={teacher.id} value={teacher.id}>
                                    {teacher.first_name} {teacher.last_name}
                                </MenuItem>
                            ))}
                        </Select>
                    </FormControl>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setOpenCreateDialog(false)}>Cancel</Button>
                    <Button
                        onClick={handleCreate}
                        variant="contained"
                        color="primary"
                        disabled={loading || !formData.name || (!formData.school_id && user.role === 'super_admin')}
                    >
                        {loading ? <CircularProgress size={24} /> : 'Create'}
                    </Button>
                </DialogActions>
            </Dialog>

            {/* Edit Class Dialog */}
            <Dialog open={openEditDialog} onClose={() => setOpenEditDialog(false)}>
                <DialogTitle>Edit Class</DialogTitle>
                <DialogContent>
                    <TextField
                        margin="normal"
                        required
                        fullWidth
                        id="name"
                        label="Class Name"
                        name="name"
                        value={formData.name}
                        onChange={handleFormChange}
                    />
                    <TextField
                        margin="normal"
                        fullWidth
                        id="description"
                        label="Description"
                        name="description"
                        multiline
                        rows={3}
                        value={formData.description}
                        onChange={handleFormChange}
                    />
                    {user.role === 'super_admin' && (
                        <FormControl fullWidth margin="normal">
                            <InputLabel>School</InputLabel>
                            <Select
                                id="school_id"
                                name="school_id"
                                value={formData.school_id}
                                label="School"
                                onChange={handleFormChange}
                                required
                            >
                                <MenuItem value="">
                                    <em>Select a school</em>
                                </MenuItem>
                                {schools.map(school => (
                                    <MenuItem key={school.id} value={school.id}>
                                        {school.name}
                                    </MenuItem>
                                ))}
                            </Select>
                        </FormControl>
                    )}
                    <FormControl fullWidth margin="normal">
                        <InputLabel>Teacher</InputLabel>
                        <Select
                            id="teacher_id"
                            name="teacher_id"
                            value={formData.teacher_id}
                            label="Teacher"
                            onChange={handleFormChange}
                        >
                            <MenuItem value="">
                                <em>Assign later</em>
                            </MenuItem>
                            {teachers.map(teacher => (
                                <MenuItem key={teacher.id} value={teacher.id}>
                                    {teacher.first_name} {teacher.last_name}
                                </MenuItem>
                            ))}
                        </Select>
                    </FormControl>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setOpenEditDialog(false)}>Cancel</Button>
                    <Button
                        onClick={handleUpdate}
                        variant="contained"
                        color="primary"
                        disabled={loading || !formData.name}
                                        >
                        {loading ? <CircularProgress size={24} /> : 'Update'}
                    </Button>
                </DialogActions>
            </Dialog>

            {/* Delete Class Dialog */}
            <Dialog open={openDeleteDialog} onClose={() => setOpenDeleteDialog(false)}>
                <DialogTitle>Delete Class</DialogTitle>
                <DialogContent>
                    <DialogContentText>
                        Are you sure you want to delete the class "{currentClass?.name}"?
                        This action cannot be undone and will remove all students from this class.
                    </DialogContentText>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setOpenDeleteDialog(false)}>Cancel</Button>
                    <Button
                        onClick={handleDelete}
                        variant="contained"
                        color="error"
                        disabled={loading}
                    >
                        {loading ? <CircularProgress size={24} /> : 'Delete'}
                    </Button>
                </DialogActions>
            </Dialog>
        </Container>
    );
};

export default ClassManagement; 