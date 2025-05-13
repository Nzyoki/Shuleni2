import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { getClasses } from '../services/classes';
import { getClassResources, createResource, updateResource, deleteResource } from '../services/resources';
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
    Tooltip,
    Chip,
    Grid,
    Link
} from '@mui/material';
import {
    Add as AddIcon,
    Edit as EditIcon,
    Delete as DeleteIcon,
    Refresh as RefreshIcon,
    CloudDownload as DownloadIcon,
    Link as LinkIcon,
    Description as FileIcon
} from '@mui/icons-material';

const ResourceManagement = () => {
    const { user } = useAuth();
    const [classes, setClasses] = useState([]);
    const [selectedClass, setSelectedClass] = useState('');
    const [resources, setResources] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    // Dialog states
    const [openCreateDialog, setOpenCreateDialog] = useState(false);
    const [openEditDialog, setOpenEditDialog] = useState(false);
    const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
    const [currentResource, setCurrentResource] = useState(null);

    // Form data
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        type: 'document',
        url: '',
        file: null
    });

    // File upload state
    const [fileName, setFileName] = useState('');

    // Fetch data (classes and resources if a class is selected)
    const fetchData = useCallback(async () => {
        setLoading(true);
        setError('');

        try {
            // Fetch classes
            const classesData = await getClasses();
            setClasses(classesData);

            // If a class is selected, fetch its resources
            if (selectedClass) {
                const resourcesData = await getClassResources(selectedClass);
                setResources(resourcesData);
            } else {
                setResources([]);
            }
        } catch (err) {
            setError(`Failed to load data: ${err.message || 'Unknown error'}`);
            console.error(err);
        } finally {
            setLoading(false);
        }
    }, [selectedClass]);

    // Initialize data
    useEffect(() => {
        fetchData();
    }, [fetchData]);

    // Handle class selection change
    const handleClassChange = (e) => {
        setSelectedClass(e.target.value);
    };

    // Reset form data
    const resetFormData = () => {
        setFormData({
            title: '',
            description: '',
            type: 'document',
            url: '',
            file: null
        });
        setFileName('');
    };

    // Handle dialog open/close
    const handleOpenCreateDialog = () => {
        resetFormData();
        setOpenCreateDialog(true);
    };

    const handleOpenEditDialog = (resource) => {
        setCurrentResource(resource);
        setFormData({
            title: resource.title,
            description: resource.description || '',
            type: resource.type,
            url: resource.url || '',
            file: null
        });
        setFileName('');
        setOpenEditDialog(true);
    };

    const handleOpenDeleteDialog = (resource) => {
        setCurrentResource(resource);
        setOpenDeleteDialog(true);
    };

    // Handle form changes
    const handleFormChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    // Handle file input change
    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setFormData(prev => ({
                ...prev,
                file: file
            }));
            setFileName(file.name);
        }
    };

    // Create resource
    const handleCreate = async () => {
        setLoading(true);
        try {
            await createResource(selectedClass, formData);
            setOpenCreateDialog(false);
            setSuccess('Resource created successfully');
            fetchData();

            // Clear success message after 3 seconds
            setTimeout(() => setSuccess(''), 3000);
        } catch (err) {
            setError(`Failed to create resource: ${err.message || 'Unknown error'}`);
        } finally {
            setLoading(false);
        }
    };

    // Update resource
    const handleUpdate = async () => {
        if (!currentResource) return;

        setLoading(true);
        try {
            await updateResource(currentResource.id, formData);
            setOpenEditDialog(false);
            setSuccess('Resource updated successfully');
            fetchData();

            // Clear success message after 3 seconds
            setTimeout(() => setSuccess(''), 3000);
        } catch (err) {
            setError(`Failed to update resource: ${err.message || 'Unknown error'}`);
        } finally {
            setLoading(false);
        }
    };

    // Delete resource
    const handleDelete = async () => {
        if (!currentResource) return;

        setLoading(true);
        try {
            await deleteResource(currentResource.id);
            setOpenDeleteDialog(false);
            setSuccess('Resource deleted successfully');
            fetchData();

            // Clear success message after 3 seconds
            setTimeout(() => setSuccess(''), 3000);
        } catch (err) {
            setError(`Failed to delete resource: ${err.message || 'Unknown error'}`);
        } finally {
            setLoading(false);
        }
    };

    // Get resource type chip
    const getResourceTypeChip = (type) => {
        switch (type) {
            case 'document':
                return <Chip label="Document" color="primary" icon={<FileIcon />} />;
            case 'video':
                return <Chip label="Video" color="secondary" />;
            case 'link':
                return <Chip label="Link" color="info" icon={<LinkIcon />} />;
            default:
                return <Chip label={type} />;
        }
    };

    // Get class name by ID
    const getClassName = (classId) => {
        const classItem = classes.find(c => c.id === parseInt(classId));
        return classItem ? classItem.name : 'Unknown Class';
    };

    // Render main content
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
                        Resource Management
                    </Typography>
                    <Box>
                        <Button
                            variant="contained"
                            color="primary"
                            startIcon={<AddIcon />}
                            onClick={handleOpenCreateDialog}
                            sx={{ mr: 1 }}
                            disabled={!selectedClass || (user.role === 'student')}
                        >
                            Add Resource
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

                {/* Class selector */}
                {classes.length > 0 ? (
                    <FormControl fullWidth margin="normal" sx={{ mb: 3 }}>
                        <InputLabel id="class-select-label">Class</InputLabel>
                        <Select
                            labelId="class-select-label"
                            id="class-select"
                            value={selectedClass}
                            label="Class"
                            onChange={handleClassChange}
                        >
                            <MenuItem value="">
                                <em>Select a class</em>
                            </MenuItem>
                            {classes.map(classItem => (
                                <MenuItem key={classItem.id} value={classItem.id}>
                                    {classItem.name}
                                </MenuItem>
                            ))}
                        </Select>
                    </FormControl>
                ) : (
                    <Alert severity="info" sx={{ mb: 3 }}>
                        No classes found. You need to create a class first before managing resources.
                    </Alert>
                )}

                {/* Resources Table */}
                {selectedClass && (
                    <TableContainer>
                        <Table>
                            <TableHead>
                                <TableRow>
                                    <TableCell>Title</TableCell>
                                    <TableCell>Type</TableCell>
                                    <TableCell>Description</TableCell>
                                    <TableCell>Actions</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {loading ? (
                                    <TableRow>
                                        <TableCell colSpan={4} align="center">
                                            <CircularProgress size={24} />
                                        </TableCell>
                                    </TableRow>
                                ) : resources.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={4} align="center">
                                            No resources found for this class
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    resources.map((resource) => (
                                        <TableRow key={resource.id}>
                                            <TableCell>
                                                <Typography variant="body1" fontWeight="medium">
                                                    {resource.title}
                                                </Typography>
                                            </TableCell>
                                            <TableCell>{getResourceTypeChip(resource.type)}</TableCell>
                                            <TableCell>{resource.description || 'No description'}</TableCell>
                                            <TableCell>
                                                {resource.file_path && (
                                                    <Tooltip title="Download">
                                                        <IconButton
                                                            color="primary"
                                                            component="a"
                                                            href={`http://localhost:5000/api/resources/public/${resource.file_path}`}
                                                            target="_blank"
                                                            download
                                                        >
                                                            <DownloadIcon />
                                                        </IconButton>
                                                    </Tooltip>
                                                )}
                                                {resource.url && (
                                                    <Tooltip title="Open Link">
                                                        <IconButton
                                                            color="primary"
                                                            component="a"
                                                            href={resource.url}
                                                            target="_blank"
                                                            rel="noopener"
                                                        >
                                                            <LinkIcon />
                                                        </IconButton>
                                                    </Tooltip>
                                                )}

                                                {/* Only show edit/delete to resource creator */}
                                                {(user.role !== 'student' && user.id === resource.created_by) && (
                                                    <>
                                                        <Tooltip title="Edit">
                                                            <IconButton
                                                                color="primary"
                                                                onClick={() => handleOpenEditDialog(resource)}
                                                            >
                                                                <EditIcon />
                                                            </IconButton>
                                                        </Tooltip>
                                                        <Tooltip title="Delete">
                                                            <IconButton
                                                                color="error"
                                                                onClick={() => handleOpenDeleteDialog(resource)}
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
                )}
            </Paper>

            {/* Create Resource Dialog */}
            <Dialog open={openCreateDialog} onClose={() => setOpenCreateDialog(false)} maxWidth="md" fullWidth>
                <DialogTitle>Add New Resource</DialogTitle>
                <DialogContent>
                    <Grid container spacing={2}>
                        <Grid item xs={12}>
                            <TextField
                                margin="normal"
                                required
                                fullWidth
                                id="title"
                                label="Title"
                                name="title"
                                value={formData.title}
                                onChange={handleFormChange}
                            />
                        </Grid>

                        <Grid item xs={12}>
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
                        </Grid>

                        <Grid item xs={12} sm={6}>
                            <FormControl fullWidth margin="normal">
                                <InputLabel id="type-label">Resource Type</InputLabel>
                                <Select
                                    labelId="type-label"
                                    id="type"
                                    name="type"
                                    value={formData.type}
                                    label="Resource Type"
                                    onChange={handleFormChange}
                                >
                                    <MenuItem value="document">Document</MenuItem>
                                    <MenuItem value="video">Video</MenuItem>
                                    <MenuItem value="link">External Link</MenuItem>
                                </Select>
                            </FormControl>
                        </Grid>

                        <Grid item xs={12} sm={6}>
                            {formData.type === 'link' ? (
                                <TextField
                                    margin="normal"
                                    fullWidth
                                    id="url"
                                    label="URL"
                                    name="url"
                                    value={formData.url}
                                    onChange={handleFormChange}
                                    placeholder="https://example.com"
                                />
                            ) : (
                                <Box sx={{ mt: 3 }}>
                                    <input
                                        type="file"
                                        id="file-upload"
                                        style={{ display: 'none' }}
                                        onChange={handleFileChange}
                                    />
                                    <label htmlFor="file-upload">
                                        <Button
                                            variant="contained"
                                            component="span"
                                        >
                                            Upload File
                                        </Button>
                                    </label>
                                    {fileName && (
                                        <Typography variant="body2" sx={{ mt: 1 }}>
                                            Selected file: {fileName}
                                        </Typography>
                                    )}
                                </Box>
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
                        disabled={loading || !formData.title ||
                            (formData.type === 'link' && !formData.url) ||
                            (formData.type !== 'link' && !formData.file)}
                    >
                        {loading ? <CircularProgress size={24} /> : 'Create'}
                    </Button>
                </DialogActions>
            </Dialog>

            {/* Edit Resource Dialog */}
            <Dialog open={openEditDialog} onClose={() => setOpenEditDialog(false)} maxWidth="md" fullWidth>
                <DialogTitle>Edit Resource</DialogTitle>
                <DialogContent>
                    <Grid container spacing={2}>
                        <Grid item xs={12}>
                            <TextField
                                margin="normal"
                                required
                                fullWidth
                                id="title"
                                label="Title"
                                name="title"
                                value={formData.title}
                                onChange={handleFormChange}
                            />
                        </Grid>

                        <Grid item xs={12}>
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
                        </Grid>

                        <Grid item xs={12} sm={6}>
                            <FormControl fullWidth margin="normal">
                                <InputLabel id="type-label">Resource Type</InputLabel>
                                <Select
                                    labelId="type-label"
                                    id="type"
                                    name="type"
                                    value={formData.type}
                                    label="Resource Type"
                                    onChange={handleFormChange}
                                >
                                    <MenuItem value="document">Document</MenuItem>
                                    <MenuItem value="video">Video</MenuItem>
                                    <MenuItem value="link">External Link</MenuItem>
                                </Select>
                            </FormControl>
                        </Grid>

                        <Grid item xs={12} sm={6}>
                            {formData.type === 'link' ? (
                                <TextField
                                    margin="normal"
                                    fullWidth
                                    id="url"
                                    label="URL"
                                    name="url"
                                    value={formData.url}
                                    onChange={handleFormChange}
                                    placeholder="https://example.com"
                                />
                            ) : (
                                <Box sx={{ mt: 3 }}>
                                    <input
                                        type="file"
                                        id="file-upload-edit"
                                        style={{ display: 'none' }}
                                        onChange={handleFileChange}
                                    />
                                    <label htmlFor="file-upload-edit">
                                        <Button
                                            variant="contained"
                                            component="span"
                                        >
                                            {currentResource?.file_path ? 'Replace File' : 'Upload File'}
                                        </Button>
                                    </label>
                                    {(fileName || currentResource?.file_path) && (
                                        <Typography variant="body2" sx={{ mt: 1 }}>
                                            {fileName ? `Selected file: ${fileName}` :
                                                currentResource?.file_path ? 'Current file will be kept' : ''}
                                        </Typography>
                                    )}
                                </Box>
                            )}
                        </Grid>
                    </Grid>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setOpenEditDialog(false)}>Cancel</Button>
                    <Button
                        onClick={handleUpdate}
                        variant="contained"
                        color="primary"
                        disabled={loading || !formData.title ||
                            (formData.type === 'link' && !formData.url)}
                    >
                        {loading ? <CircularProgress size={24} /> : 'Update'}
                    </Button>
                </DialogActions>
            </Dialog>

            {/* Delete Resource Dialog */}
            <Dialog open={openDeleteDialog} onClose={() => setOpenDeleteDialog(false)}>
                <DialogTitle>Delete Resource</DialogTitle>
                <DialogContent>
                    <DialogContentText>
                        Are you sure you want to delete the resource "{currentResource?.title}"?
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
        </Container >
    );
};

export default ResourceManagement; 