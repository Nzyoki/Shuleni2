import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { getUsers, createUser, updateUser, deleteUser } from '../services/users';
import { getSchools } from '../services/schools';
import {
    Container,
    Paper,
    Typography,
    Box,
    Button,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    TextField,
    Dialog,
    DialogActions,
    DialogContent,
    DialogContentText,
    DialogTitle,
    FormControl,
    InputLabel,
    MenuItem,
    Select,
    IconButton,
    Tooltip,
    CircularProgress,
    Alert,
    Grid,
    Chip
} from '@mui/material';
import {
    Add as AddIcon,
    Delete as DeleteIcon,
    Edit as EditIcon,
    Refresh as RefreshIcon,
    Search as SearchIcon,
    Clear as ClearIcon
} from '@mui/icons-material';

const UserManagement = () => {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [users, setUsers] = useState([]);
    const [schools, setSchools] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    // Filter states
    const [filters, setFilters] = useState({
        role: '',
        school_id: ''
    });

    // Dialog states
    const [openCreateDialog, setOpenCreateDialog] = useState(false);
    const [openEditDialog, setOpenEditDialog] = useState(false);
    const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
    const [currentUser, setCurrentUser] = useState(null);

    // Form data
    const [formData, setFormData] = useState({
        email: '',
        password: '',
        first_name: '',
        last_name: '',
        role: 'student',
        school_id: '',
        is_active: true
    });

    // Check if user has permission
    useEffect(() => {
        if (!user || (user.role !== 'super_admin' && user.role !== 'school_admin')) {
            navigate('/dashboard');
        }
    }, [user, navigate]);

    // Load users and schools
    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            try {
                // Fetch schools first
                const schoolsData = await getSchools();
                setSchools(schoolsData);

                // Then fetch users with any filters
                const usersData = await getUsers(filters);
                setUsers(usersData);
                setError('');
            } catch (err) {
                setError('Failed to load data. ' + (err.message || ''));
                console.error(err);
            } finally {
                setLoading(false);
            }
        };

        if (user) {
            fetchData();
        }
    }, [user, filters]);

    const handleFilterChange = (e) => {
        const { name, value } = e.target;
        setFilters((prev) => ({
            ...prev,
            [name]: value
        }));
    };

    const resetFilters = () => {
        setFilters({
            role: '',
            school_id: ''
        });
    };

    const refreshData = async () => {
        setLoading(true);
        try {
            const data = await getUsers(filters);
            setUsers(data);
            setSuccess('Data refreshed successfully');
            setTimeout(() => setSuccess(''), 3000);
        } catch (err) {
            setError('Failed to refresh data: ' + (err.message || ''));
        } finally {
            setLoading(false);
        }
    };

    // Dialog handlers
    const handleOpenCreateDialog = () => {
        setFormData({
            email: '',
            password: '',
            first_name: '',
            last_name: '',
            role: 'student',
            school_id: user.role === 'school_admin' ? user.school_id : '',
            is_active: true
        });
        setOpenCreateDialog(true);
    };

    const handleOpenEditDialog = (userData) => {
        setCurrentUser(userData);
        setFormData({
            email: userData.email,
            password: '', // Don't set password for edit
            first_name: userData.first_name,
            last_name: userData.last_name,
            role: userData.role,
            school_id: userData.school_id || '',
            is_active: userData.is_active
        });
        setOpenEditDialog(true);
    };

    const handleOpenDeleteDialog = (userData) => {
        setCurrentUser(userData);
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

            // Convert school_id to number if present
            if (data.school_id) {
                data.school_id = parseInt(data.school_id);
            }

            // For super_admin role, school_id should be null
            if (data.role === 'super_admin') {
                data.school_id = null;
            }

            // For school_admin role with school_admin user, force their school
            if (user.role === 'school_admin') {
                data.school_id = user.school_id;
            }

            await createUser(data);
            setOpenCreateDialog(false);
            setSuccess('User created successfully');
            refreshData();
        } catch (err) {
            setError('Failed to create user: ' + (err.message || ''));
        } finally {
            setLoading(false);
        }
    };

    const handleUpdate = async () => {
        if (!currentUser) return;

        setLoading(true);
        try {
            const data = { ...formData };

            // Don't send empty password
            if (!data.password) {
                delete data.password;
            }

            // Convert school_id to number if present
            if (data.school_id) {
                data.school_id = parseInt(data.school_id);
            }

            // For super_admin role, school_id should be null
            if (data.role === 'super_admin') {
                data.school_id = null;
            }

            await updateUser(currentUser.id, data);
            setOpenEditDialog(false);
            setSuccess('User updated successfully');
            refreshData();
        } catch (err) {
            setError('Failed to update user: ' + (err.message || ''));
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async () => {
        if (!currentUser) return;

        setLoading(true);
        try {
            await deleteUser(currentUser.id);
            setOpenDeleteDialog(false);
            setSuccess('User deleted successfully');
            refreshData();
        } catch (err) {
            setError('Failed to delete user: ' + (err.message || ''));
        } finally {
            setLoading(false);
        }
    };

    // Helper to get school name from ID
    const getSchoolName = (schoolId) => {
        if (!schoolId) return 'N/A';
        const school = schools.find(s => s.id === schoolId);
        return school ? school.name : 'Unknown';
    };

    // Role colors
    const roleColors = {
        super_admin: 'error',
        school_admin: 'warning',
        teacher: 'success',
        student: 'info'
    };

    return (
        <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
            <Paper sx={{ p: 3 }}>
                <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
                    <Typography variant="h4" component="h1">
                        User Management
                    </Typography>
                    <Button
                        variant="contained"
                        color="primary"
                        startIcon={<AddIcon />}
                        onClick={handleOpenCreateDialog}
                    >
                        Add User
                    </Button>
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

                {/* Filters */}
                <Paper sx={{ p: 2, mb: 3 }}>
                    <Typography variant="h6" mb={2}>
                        Filters
                    </Typography>
                    <Grid container spacing={2} alignItems="center">
                        <Grid item xs={12} sm={4}>
                            <FormControl fullWidth size="small">
                                <InputLabel id="role-filter-label">Role</InputLabel>
                                <Select
                                    labelId="role-filter-label"
                                    id="role"
                                    name="role"
                                    value={filters.role}
                                    label="Role"
                                    onChange={handleFilterChange}
                                >
                                    <MenuItem value="">All Roles</MenuItem>
                                    <MenuItem value="super_admin">Super Admin</MenuItem>
                                    <MenuItem value="school_admin">School Admin</MenuItem>
                                    <MenuItem value="teacher">Teacher</MenuItem>
                                    <MenuItem value="student">Student</MenuItem>
                                </Select>
                            </FormControl>
                        </Grid>

                        {user.role === 'super_admin' && (
                            <Grid item xs={12} sm={4}>
                                <FormControl fullWidth size="small">
                                    <InputLabel id="school-filter-label">School</InputLabel>
                                    <Select
                                        labelId="school-filter-label"
                                        id="school_id"
                                        name="school_id"
                                        value={filters.school_id}
                                        label="School"
                                        onChange={handleFilterChange}
                                    >
                                        <MenuItem value="">All Schools</MenuItem>
                                        {schools.map(school => (
                                            <MenuItem key={school.id} value={school.id}>
                                                {school.name}
                                            </MenuItem>
                                        ))}
                                    </Select>
                                </FormControl>
                            </Grid>
                        )}

                        <Grid item xs={12} sm={4}>
                            <Box display="flex" gap={1}>
                                <Button
                                    variant="outlined"
                                    startIcon={<SearchIcon />}
                                    onClick={refreshData}
                                >
                                    Apply
                                </Button>
                                <Button
                                    variant="outlined"
                                    color="secondary"
                                    startIcon={<ClearIcon />}
                                    onClick={resetFilters}
                                >
                                    Clear
                                </Button>
                                <IconButton
                                    color="primary"
                                    onClick={refreshData}
                                    disabled={loading}
                                >
                                    <RefreshIcon />
                                </IconButton>
                            </Box>
                        </Grid>
                    </Grid>
                </Paper>

                {/* User Table */}
                <TableContainer component={Paper}>
                    <Table>
                        <TableHead>
                            <TableRow>
                                <TableCell>Name</TableCell>
                                <TableCell>Email</TableCell>
                                <TableCell>Role</TableCell>
                                <TableCell>School</TableCell>
                                <TableCell>Status</TableCell>
                                <TableCell>Actions</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {loading ? (
                                <TableRow>
                                    <TableCell colSpan={6} align="center">
                                        <CircularProgress />
                                    </TableCell>
                                </TableRow>
                            ) : users.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={6} align="center">
                                        No users found
                                    </TableCell>
                                </TableRow>
                            ) : (
                                users.map((userItem) => (
                                    <TableRow key={userItem.id}>
                                        <TableCell>
                                            {userItem.first_name} {userItem.last_name}
                                        </TableCell>
                                        <TableCell>{userItem.email}</TableCell>
                                        <TableCell>
                                            <Chip
                                                label={userItem.role}
                                                color={roleColors[userItem.role] || 'default'}
                                                size="small"
                                            />
                                        </TableCell>
                                        <TableCell>
                                            {getSchoolName(userItem.school_id)}
                                        </TableCell>
                                        <TableCell>
                                            <Chip
                                                label={userItem.is_active ? 'Active' : 'Inactive'}
                                                color={userItem.is_active ? 'success' : 'error'}
                                                size="small"
                                            />
                                        </TableCell>
                                        <TableCell>
                                            <Box display="flex" gap={1}>
                                                <Tooltip title="Edit">
                                                    <IconButton
                                                        color="primary"
                                                        onClick={() => handleOpenEditDialog(userItem)}
                                                    >
                                                        <EditIcon />
                                                    </IconButton>
                                                </Tooltip>

                                                {/* Don't allow deleting self or other super_admins for non-super_admins */}
                                                {!(user.id === userItem.id ||
                                                    (userItem.role === 'super_admin' && user.role !== 'super_admin')) && (
                                                        <Tooltip title="Delete">
                                                            <IconButton
                                                                color="error"
                                                                onClick={() => handleOpenDeleteDialog(userItem)}
                                                            >
                                                                <DeleteIcon />
                                                            </IconButton>
                                                        </Tooltip>
                                                    )}
                                            </Box>
                                        </TableCell>
                                    </TableRow>
                                ))
                            )}
                        </TableBody>
                    </Table>
                </TableContainer>
            </Paper>

            {/* Create User Dialog */}
            <Dialog open={openCreateDialog} onClose={() => setOpenCreateDialog(false)} maxWidth="sm" fullWidth>
                <DialogTitle>Create New User</DialogTitle>
                <DialogContent>
                    <Grid container spacing={2}>
                        <Grid item xs={12} sm={6}>
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
                        </Grid>
                        <Grid item xs={12} sm={6}>
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
                        </Grid>
                        <Grid item xs={12}>
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
                        </Grid>
                        <Grid item xs={12}>
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
                        </Grid>
                        <Grid item xs={12} sm={6}>
                            <FormControl fullWidth margin="normal">
                                <InputLabel id="role-label">Role</InputLabel>
                                <Select
                                    labelId="role-label"
                                    id="role"
                                    name="role"
                                    value={formData.role}
                                    label="Role"
                                    onChange={handleFormChange}
                                >
                                    {/* Only super_admin can create other super_admins */}
                                    {user.role === 'super_admin' && (
                                        <MenuItem value="super_admin">Super Admin</MenuItem>
                                    )}
                                    <MenuItem value="school_admin">School Admin</MenuItem>
                                    <MenuItem value="teacher">Teacher</MenuItem>
                                    <MenuItem value="student">Student</MenuItem>
                                </Select>
                            </FormControl>
                        </Grid>
                        <Grid item xs={12} sm={6}>
                            {/* School selection - not needed for super_admin role */}
                            {formData.role !== 'super_admin' && (
                                <FormControl fullWidth margin="normal">
                                    <InputLabel id="school-label">School</InputLabel>
                                    <Select
                                        labelId="school-label"
                                        id="school_id"
                                        name="school_id"
                                        value={user.role === 'school_admin' ? user.school_id : formData.school_id}
                                        label="School"
                                        onChange={handleFormChange}
                                        disabled={user.role === 'school_admin'}
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
                        </Grid>
                    </Grid>
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

            {/* Edit User Dialog */}
            <Dialog open={openEditDialog} onClose={() => setOpenEditDialog(false)} maxWidth="sm" fullWidth>
                <DialogTitle>Edit User</DialogTitle>
                <DialogContent>
                    <Grid container spacing={2}>
                        <Grid item xs={12} sm={6}>
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
                        </Grid>
                        <Grid item xs={12} sm={6}>
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
                        </Grid>
                        <Grid item xs={12}>
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
                        </Grid>
                        <Grid item xs={12}>
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
                        </Grid>
                        <Grid item xs={12} sm={6}>
                            <FormControl fullWidth margin="normal">
                                <InputLabel id="role-label">Role</InputLabel>
                                <Select
                                    labelId="role-label"
                                    id="role"
                                    name="role"
                                    value={formData.role}
                                    label="Role"
                                    onChange={handleFormChange}
                                    disabled={user.role !== 'super_admin'}
                                >
                                    {/* Only super_admin can set super_admin role */}
                                    {user.role === 'super_admin' && (
                                        <MenuItem value="super_admin">Super Admin</MenuItem>
                                    )}
                                    <MenuItem value="school_admin">School Admin</MenuItem>
                                    <MenuItem value="teacher">Teacher</MenuItem>
                                    <MenuItem value="student">Student</MenuItem>
                                </Select>
                            </FormControl>
                        </Grid>
                        <Grid item xs={12} sm={6}>
                            {/* School selection - not needed for super_admin role */}
                            {formData.role !== 'super_admin' && (
                                <FormControl fullWidth margin="normal">
                                    <InputLabel id="school-label">School</InputLabel>
                                    <Select
                                        labelId="school-label"
                                        id="school_id"
                                        name="school_id"
                                        value={user.role === 'school_admin' ? user.school_id : formData.school_id}
                                        label="School"
                                        onChange={handleFormChange}
                                        disabled={user.role !== 'super_admin'}
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
                        </Grid>
                        <Grid item xs={12}>
                            <FormControl fullWidth margin="normal">
                                <InputLabel id="status-label">Status</InputLabel>
                                <Select
                                    labelId="status-label"
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
                        </Grid>
                    </Grid>
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

            {/* Delete User Dialog */}
            <Dialog open={openDeleteDialog} onClose={() => setOpenDeleteDialog(false)}>
                <DialogTitle>Delete User</DialogTitle>
                <DialogContent>
                    <DialogContentText>
                        Are you sure you want to delete the user "{currentUser?.first_name} {currentUser?.last_name}"?
                        This action cannot be undone.
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

export default UserManagement; 