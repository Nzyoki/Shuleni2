import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { getStudents, getStudentsBySchool, createStudent, updateStudent, deleteStudent } from '../services/students';
import { getSchools } from '../services/schools';
import { getClasses } from '../services/classes';
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
    Chip,
    IconButton,
    Tooltip
} from '@mui/material';
import {
    Add as AddIcon,
    Edit as EditIcon,
    Delete as DeleteIcon,
    Refresh as RefreshIcon
} from '@mui/icons-material';

const StudentManagement = () => {
    const { user } = useAuth();
    const [students, setStudents] = useState([]);
    const [schools, setSchools] = useState([]);
    const [classes, setClasses] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    // Dialog states
    const [openCreateDialog, setOpenCreateDialog] = useState(false);
    const [openEditDialog, setOpenEditDialog] = useState(false);
    const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
    const [currentStudent, setCurrentStudent] = useState(null);

    // Form data
    const [formData, setFormData] = useState({
        email: '',
        password: '',
        first_name: '',
        last_name: '',
        school_id: '',
        class_id: '',
        is_active: true
    });

    useEffect(() => {
        fetchData();
    }, [user]);

    const fetchData = async () => {
        setLoading(true);
        setError('');

        try {
            // Fetch schools first for super_admin
            let schoolsData = [];
            if (user.role === 'super_admin') {
                schoolsData = await getSchools();
                setSchools(schoolsData);
            }

            // Fetch students based on user role
            let studentsData = [];
            if (user.role === 'super_admin') {
                // Super admin can see all students
                studentsData = await getStudents();
            } else if (user.role === 'school_admin') {
                // School admin can only see students in their school
                studentsData = await getStudentsBySchool(user.school_id);
            }

            // Fetch classes based on user role
            let classesData = [];
            try {
                classesData = await getClasses();
                setClasses(classesData);
            } catch (err) {
                console.error('Error fetching classes:', err);
            }

            setStudents(studentsData);
        } catch (err) {
            setError(`Failed to load data: ${err.message || 'Unknown error'}`);
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleOpenCreateDialog = () => {
        // Initialize with defaults for school_admin
        setFormData({
            email: '',
            password: '',
            first_name: '',
            last_name: '',
            school_id: user.role === 'school_admin' ? user.school_id : '',
            class_id: '',
            is_active: true
        });
        setOpenCreateDialog(true);
    };

    const handleOpenEditDialog = (student) => {
        setCurrentStudent(student);
        setFormData({
            email: student.email,
            password: '', // Don't set password for edit
            first_name: student.first_name,
            last_name: student.last_name,
            school_id: student.school_id || '',
            class_id: student.class_id || '',
            is_active: student.is_active
        });
        setOpenEditDialog(true);
    };

    const handleOpenDeleteDialog = (student) => {
        setCurrentStudent(student);
        setOpenDeleteDialog(true);
    };

    const handleFormChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));
    };

    const handleCreate = async () => {
        setLoading(true);
        try {
            const data = { ...formData };

            // For school_admin, force their school
            if (user.role === 'school_admin') {
                data.school_id = user.school_id;
            }

            // Convert IDs to numbers
            if (data.school_id) data.school_id = parseInt(data.school_id);
            if (data.class_id) data.class_id = parseInt(data.class_id);

            await createStudent(data);
            setOpenCreateDialog(false);
            setSuccess('Student created successfully');
            fetchData();
        } catch (err) {
            setError(`Failed to create student: ${err.message || 'Unknown error'}`);
        } finally {
            setLoading(false);
        }
    };

    const handleUpdate = async () => {
        if (!currentStudent) return;

        setLoading(true);
        try {
            const data = { ...formData };

            // Don't send empty password
            if (!data.password) {
                delete data.password;
            }

            // For school_admin, force their school
            if (user.role === 'school_admin') {
                data.school_id = user.school_id;
            }

            // Convert IDs to numbers
            if (data.school_id) data.school_id = parseInt(data.school_id);
            if (data.class_id) data.class_id = parseInt(data.class_id);

            await updateStudent(currentStudent.id, data);
            setOpenEditDialog(false);
            setSuccess('Student updated successfully');
            fetchData();
        } catch (err) {
            setError(`Failed to update student: ${err.message || 'Unknown error'}`);
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async () => {
        if (!currentStudent) return;

        setLoading(true);
        try {
            await deleteStudent(currentStudent.id);
            setOpenDeleteDialog(false);
            setSuccess('Student deleted successfully');
            fetchData();
        } catch (err) {
            setError(`Failed to delete student: ${err.message || 'Unknown error'}`);
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

    // Helper to get class name
    const getClassName = (classId) => {
        if (!classId) return 'Not assigned';
        const classObj = classes.find(c => c.id === classId);
        return classObj ? classObj.name : 'Unknown';
    };

    if (loading && students.length === 0) {
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
                        Student Management
                    </Typography>
                    <Box>
                        <Button
                            variant="contained"
                            color="primary"
                            startIcon={<AddIcon />}
                            onClick={handleOpenCreateDialog}
                            sx={{ mr: 1 }}
                >
                    Add Student
                        </Button>
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
                                <TableCell>Name</TableCell>
                                <TableCell>Email</TableCell>
                                {user.role === 'super_admin' && <TableCell>School</TableCell>}
                                <TableCell>Class</TableCell>
                                <TableCell>Status</TableCell>
                                <TableCell>Actions</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {loading ? (
                                <TableRow>
                                    <TableCell colSpan={user.role === 'super_admin' ? 6 : 5} align="center">
                                        <CircularProgress size={24} />
                                    </TableCell>
                                </TableRow>
                            ) : students.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={user.role === 'super_admin' ? 6 : 5} align="center">
                                    No students found
                                    </TableCell>
                                </TableRow>
                        ) : (
                            students.map((student) => (
                                    <TableRow key={student.id}>
                                        <TableCell>
                                            {student.first_name} {student.last_name}
                                        </TableCell>
                                        <TableCell>{student.email}</TableCell>
                                        {user.role === 'super_admin' && (
                                            <TableCell>{getSchoolName(student.school_id)}</TableCell>
                                        )}
                                        <TableCell>{getClassName(student.class_id)}</TableCell>
                                        <TableCell>
                                            <Chip
                                                label={student.is_active ? 'Active' : 'Inactive'}
                                                color={student.is_active ? 'success' : 'error'}
                                                size="small"
                                            />
                                        </TableCell>
                                        <TableCell>
                                            <Tooltip title="Edit">
                                                <IconButton
                                                    color="primary"
                                                    onClick={() => handleOpenEditDialog(student)}
                                                >
                                                    <EditIcon />
                                                </IconButton>
                                            </Tooltip>
                                            <Tooltip title="Delete">
                                                <IconButton
                                                    color="error"
                                                    onClick={() => handleOpenDeleteDialog(student)}
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
            </Paper>

            {/* Create Student Dialog */}
            <Dialog open={openCreateDialog} onClose={() => setOpenCreateDialog(false)}>
                <DialogTitle>Create New Student</DialogTitle>
                <DialogContent>
                    <TextField
                        margin="normal"
                        required
                        fullWidth
                        id="first_name"
                        label="First Name"
                        name="first_name"
                        value={formData.first_name}
                        onChange={handleFormChange}
                    />
                    <TextField
                        margin="normal"
                        required
                        fullWidth
                        id="last_name"
                        label="Last Name"
                        name="last_name"
                        value={formData.last_name}
                        onChange={handleFormChange}
                    />
                    <TextField
                        margin="normal"
                        required
                        fullWidth
                        id="email"
                        label="Email Address"
                        name="email"
                        type="email"
                        value={formData.email}
                        onChange={handleFormChange}
                    />
                    <TextField
                        margin="normal"
                        required
                        fullWidth
                        id="password"
                        label="Password"
                        name="password"
                        type="password"
                        value={formData.password}
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
                            >
                                <MenuItem value="">
                                    <em>None</em>
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
                        <InputLabel>Class</InputLabel>
                        <Select
                            id="class_id"
                            name="class_id"
                            value={formData.class_id}
                            label="Class"
                            onChange={handleFormChange}
                        >
                            <MenuItem value="">
                                <em>None</em>
                            </MenuItem>
                            {classes
                                .filter(c => user.role === 'super_admin' || c.school_id === user.school_id)
                                .map(classItem => (
                                    <MenuItem key={classItem.id} value={classItem.id}>
                                        {classItem.name}
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
                        disabled={loading}
                    >
                        {loading ? <CircularProgress size={24} /> : 'Create'}
                    </Button>
                </DialogActions>
            </Dialog>

            {/* Edit Student Dialog */}
            <Dialog open={openEditDialog} onClose={() => setOpenEditDialog(false)}>
                <DialogTitle>Edit Student</DialogTitle>
                <DialogContent>
                    <TextField
                        margin="normal"
                        required
                        fullWidth
                        id="first_name"
                        label="First Name"
                        name="first_name"
                        value={formData.first_name}
                        onChange={handleFormChange}
                    />
                    <TextField
                        margin="normal"
                        required
                        fullWidth
                        id="last_name"
                        label="Last Name"
                        name="last_name"
                        value={formData.last_name}
                        onChange={handleFormChange}
                    />
                    <TextField
                        margin="normal"
                        required
                        fullWidth
                        id="email"
                        label="Email Address"
                        name="email"
                        type="email"
                        value={formData.email}
                        onChange={handleFormChange}
                    />
                    <TextField
                        margin="normal"
                        fullWidth
                        id="password"
                        label="Password (leave blank to keep unchanged)"
                        name="password"
                        type="password"
                        value={formData.password}
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
                            >
                                <MenuItem value="">
                                    <em>None</em>
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
                        <InputLabel>Class</InputLabel>
                        <Select
                            id="class_id"
                            name="class_id"
                            value={formData.class_id}
                            label="Class"
                            onChange={handleFormChange}
                        >
                            <MenuItem value="">
                                <em>None</em>
                            </MenuItem>
                            {classes
                                .filter(c => user.role === 'super_admin' || c.school_id === user.school_id)
                                .map(classItem => (
                                    <MenuItem key={classItem.id} value={classItem.id}>
                                        {classItem.name}
                                    </MenuItem>
                                ))}
                        </Select>
                    </FormControl>
                    <FormControl fullWidth margin="normal">
                        <InputLabel>Status</InputLabel>
                        <Select
                            id="is_active"
                            name="is_active"
                            value={formData.is_active}
                            label="Status"
                            onChange={handleFormChange}
                        >
                            <MenuItem value={true}>Active</MenuItem>
                            <MenuItem value={false}>Inactive</MenuItem>
                        </Select>
                    </FormControl>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setOpenEditDialog(false)}>Cancel</Button>
                    <Button
                        onClick={handleUpdate}
                        variant="contained"
                        color="primary"
                        disabled={loading}
                    >
                        {loading ? <CircularProgress size={24} /> : 'Update'}
                    </Button>
                </DialogActions>
            </Dialog>

            {/* Delete Student Dialog */}
            <Dialog open={openDeleteDialog} onClose={() => setOpenDeleteDialog(false)}>
                <DialogTitle>Delete Student</DialogTitle>
                <DialogContent>
                    <DialogContentText>
                        Are you sure you want to delete {currentStudent?.first_name} {currentStudent?.last_name}? This action cannot be undone.
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

export default StudentManagement; 