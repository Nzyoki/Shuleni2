import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { getClasses } from '../services/classes';
import {
    getAssessmentsByClass,
    createAssessment,
    updateAssessment,
    deleteAssessment,
    getAssessmentSubmissions
} from '../services/assessments';
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
    Tooltip,
    Grid,
} from '@mui/material';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { LocalizationProvider, DatePicker } from '@mui/x-date-pickers';
import {
    Add as AddIcon,
    Edit as EditIcon,
    Delete as DeleteIcon,
    List as ListIcon,
    Refresh as RefreshIcon,
    Assignment as AssignmentIcon
} from '@mui/icons-material';
import AssessmentSubmission from '../components/AssessmentSubmission';

const AssessmentManagement = () => {
    const { user } = useAuth();
    const [classes, setClasses] = useState([]);
    const [selectedClass, setSelectedClass] = useState('');
    const [assessments, setAssessments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    // Dialog states
    const [openCreateDialog, setOpenCreateDialog] = useState(false);
    const [openEditDialog, setOpenEditDialog] = useState(false);
    const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
    const [openSubmissionsDialog, setOpenSubmissionsDialog] = useState(false);
    const [currentAssessment, setCurrentAssessment] = useState(null);
    const [submissions, setSubmissions] = useState([]);
    const [openSubmitDialog, setOpenSubmitDialog] = useState(false);
    const [currentAssessmentForSubmission, setCurrentAssessmentForSubmission] = useState(null);

    // Form data
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        type: 'quiz',
        total_points: 100,
        due_date: new Date().toISOString().split('T')[0]
    });

    const fetchData = useCallback(async () => {
        setLoading(true);
        setError('');

        try {
            // Fetch classes first
            const classesData = await getClasses();

            // Filter classes to those where the user is a teacher or from the user's school if admin
            let filteredClasses = classesData;
            if (user.role === 'teacher') {
                filteredClasses = classesData.filter(c => c.teacher_id === user.id);
            } else if (user.role === 'school_admin') {
                filteredClasses = classesData.filter(c => c.school_id === user.school_id);
            }

            setClasses(filteredClasses);

            // If there are classes, select the first one and fetch its assessments
            if (filteredClasses.length > 0) {
                const firstClassId = filteredClasses[0].id;
                setSelectedClass(firstClassId);

                // Fetch assessments for this class
                const assessmentsData = await getAssessmentsByClass(firstClassId);
                setAssessments(assessmentsData);
            } else {
                setAssessments([]);
            }
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

    const handleClassChange = async (e) => {
        const classId = e.target.value;
        setSelectedClass(classId);
        setLoading(true);

        try {
            const assessmentsData = await getAssessmentsByClass(classId);
            setAssessments(assessmentsData);
            setError('');
        } catch (err) {
            setError(`Failed to load assessments: ${err.message || 'Unknown error'}`);
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleOpenCreateDialog = () => {
        setFormData({
            title: '',
            description: '',
            type: 'quiz',
            total_points: 100,
            due_date: new Date().toISOString().split('T')[0]
        });
        setOpenCreateDialog(true);
    };

    const handleOpenEditDialog = (assessment) => {
        setCurrentAssessment(assessment);
        setFormData({
            title: assessment.title,
            description: assessment.description || '',
            type: assessment.type,
            total_points: assessment.total_points,
            due_date: assessment.due_date ? new Date(assessment.due_date).toISOString().split('T')[0] : ''
        });
        setOpenEditDialog(true);
    };

    const handleOpenDeleteDialog = (assessment) => {
        setCurrentAssessment(assessment);
        setOpenDeleteDialog(true);
    };

    const handleOpenSubmissionsDialog = async (assessment) => {
        setCurrentAssessment(assessment);
        setLoading(true);

        try {
            const submissionsData = await getAssessmentSubmissions(assessment.id);
            setSubmissions(submissionsData);
            setOpenSubmissionsDialog(true);
        } catch (err) {
            setError(`Failed to load submissions: ${err.message || 'Unknown error'}`);
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleOpenSubmitDialog = (assessment) => {
        setCurrentAssessmentForSubmission(assessment);
        setOpenSubmitDialog(true);
    };

    const handleFormChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleDateChange = (date) => {
        if (date) {
            const formattedDate = date.toISOString().split('T')[0];
            setFormData(prev => ({
                ...prev,
                due_date: formattedDate
            }));
        }
    };

    const handleCreate = async () => {
        if (!selectedClass) {
            setError('Please select a class first');
            return;
        }

        setLoading(true);
        try {
            const data = { ...formData };

            await createAssessment(selectedClass, data);
            setOpenCreateDialog(false);
            setSuccess('Assessment created successfully');

            // Refresh the assessments list
            const updatedAssessments = await getAssessmentsByClass(selectedClass);
            setAssessments(updatedAssessments);

            // Clear success message after 3 seconds
            setTimeout(() => setSuccess(''), 3000);
        } catch (err) {
            setError(`Failed to create assessment: ${err.message || 'Unknown error'}`);
        } finally {
            setLoading(false);
        }
    };

    const handleUpdate = async () => {
        if (!currentAssessment) return;

        setLoading(true);
        try {
            const data = { ...formData };

            await updateAssessment(currentAssessment.id, data);
            setOpenEditDialog(false);
            setSuccess('Assessment updated successfully');

            // Refresh the assessments list
            const updatedAssessments = await getAssessmentsByClass(selectedClass);
            setAssessments(updatedAssessments);

            // Clear success message after 3 seconds
            setTimeout(() => setSuccess(''), 3000);
        } catch (err) {
            setError(`Failed to update assessment: ${err.message || 'Unknown error'}`);
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async () => {
        if (!currentAssessment) return;

        setLoading(true);
        try {
            await deleteAssessment(currentAssessment.id);
            setOpenDeleteDialog(false);
            setSuccess('Assessment deleted successfully');

            // Refresh the assessments list
            const updatedAssessments = await getAssessmentsByClass(selectedClass);
            setAssessments(updatedAssessments);

            // Clear success message after 3 seconds
            setTimeout(() => setSuccess(''), 3000);
        } catch (err) {
            setError(`Failed to delete assessment: ${err.message || 'Unknown error'}`);
        } finally {
        setLoading(false);
        }
    };

    if (loading && assessments.length === 0 && classes.length === 0) {
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
                        Assessment Management
                    </Typography>
                    <Box>
                        {user.role !== 'student' && (
                            <Button
                                variant="contained"
                                color="primary"
                                startIcon={<AddIcon />}
                                onClick={handleOpenCreateDialog}
                                sx={{ mr: 1 }}
                                disabled={classes.length === 0}
                >
                    Create Assessment
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
                            {classes.map(classItem => (
                                <MenuItem key={classItem.id} value={classItem.id}>
                                    {classItem.name}
                                </MenuItem>
                            ))}
                        </Select>
                    </FormControl>
                ) : (
                    <Alert severity="info" sx={{ mb: 3 }}>
                        No classes found. You need to create a class first before managing assessments.
                    </Alert>
                )}

                {/* Assessments Table */}
                <TableContainer>
                    <Table>
                        <TableHead>
                            <TableRow>
                                <TableCell>Title</TableCell>
                                <TableCell>Type</TableCell>
                                <TableCell>Points</TableCell>
                                <TableCell>Due Date</TableCell>
                                <TableCell>Actions</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {loading ? (
                                <TableRow>
                                    <TableCell colSpan={5} align="center">
                                        <CircularProgress size={24} />
                                    </TableCell>
                                </TableRow>
                            ) : assessments.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={5} align="center">
                                        No assessments found for this class
                                    </TableCell>
                                </TableRow>
                        ) : (
                            assessments.map((assessment) => (
                                    <TableRow key={assessment.id}>
                                        <TableCell>
                                            <Typography variant="body1" fontWeight="medium">
                                                {assessment.title}
                                            </Typography>
                                            <Typography variant="body2" color="textSecondary">
                                                {assessment.description?.substring(0, 50)}
                                                {assessment.description?.length > 50 ? '...' : ''}
                                            </Typography>
                                        </TableCell>
                                        <TableCell>
                                            <Chip
                                                label={assessment.type}
                                                color={
                                                    assessment.type === 'quiz' ? 'primary' :
                                                        assessment.type === 'exam' ? 'error' : 'info'
                                                }
                                                size="small"
                                            />
                                        </TableCell>
                                        <TableCell>{assessment.total_points}</TableCell>
                                        <TableCell>
                                            {assessment.due_date ?
                                                new Date(assessment.due_date).toLocaleDateString() :
                                                'No due date'
                                            }
                                        </TableCell>
                                        <TableCell>
                                            <Box display="flex">
                                                {user.role !== 'student' && (
                                                    <>
                                                        <Tooltip title="Edit">
                                                            <IconButton
                                                                color="primary"
                                                                onClick={() => handleOpenEditDialog(assessment)}
                                                            >
                                                                <EditIcon />
                                                            </IconButton>
                                                        </Tooltip>
                                                        <Tooltip title="Delete">
                                                            <IconButton
                                                                color="error"
                                                                onClick={() => handleOpenDeleteDialog(assessment)}
                                                            >
                                                                <DeleteIcon />
                                                            </IconButton>
                                                        </Tooltip>
                                                    </>
                                                )}
                                                {user.role !== 'student' && (
                                                    <Tooltip title="View Submissions">
                                                        <IconButton
                                                            color="info"
                                                            onClick={() => handleOpenSubmissionsDialog(assessment)}
                                                        >
                                                            <ListIcon />
                                                        </IconButton>
                                                    </Tooltip>
                                                )}
                                                {user.role === 'student' && (
                                                    <Tooltip title="Submit Assessment">
                                                        <IconButton
                                                            color="primary"
                                                            onClick={() => handleOpenSubmitDialog(assessment)}
                                                        >
                                                            <AssignmentIcon />
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

            {/* Create Assessment Dialog */}
            <Dialog open={openCreateDialog} onClose={() => setOpenCreateDialog(false)} maxWidth="md" fullWidth>
                <DialogTitle>Create New Assessment</DialogTitle>
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
                                rows={4}
                                value={formData.description}
                                onChange={handleFormChange}
                            />
                        </Grid>
                        <Grid item xs={12} sm={4}>
                            <FormControl fullWidth margin="normal">
                                <InputLabel id="type-label">Type</InputLabel>
                                <Select
                                    labelId="type-label"
                                    id="type"
                                    name="type"
                                    value={formData.type}
                                    label="Type"
                                    onChange={handleFormChange}
                                >
                                    <MenuItem value="quiz">Quiz</MenuItem>
                                    <MenuItem value="exam">Exam</MenuItem>
                                    <MenuItem value="assignment">Assignment</MenuItem>
                                </Select>
                            </FormControl>
                        </Grid>
                        <Grid item xs={12} sm={4}>
                            <TextField
                                margin="normal"
                                required
                                fullWidth
                                id="total_points"
                                label="Total Points"
                                name="total_points"
                                type="number"
                                value={formData.total_points}
                                onChange={handleFormChange}
                                InputProps={{ inputProps: { min: 1 } }}
                            />
                        </Grid>
                        <Grid item xs={12} sm={4}>
                            <LocalizationProvider dateAdapter={AdapterDateFns}>
                                <DatePicker
                                    label="Due Date"
                                    value={formData.due_date ? new Date(formData.due_date) : null}
                                    onChange={handleDateChange}
                                    renderInput={(params) =>
                                        <TextField
                                            {...params}
                                            fullWidth
                                            margin="normal"
                                        />
                                    }
                                    sx={{ width: '100%' }}
                                />
                            </LocalizationProvider>
                        </Grid>
                    </Grid>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setOpenCreateDialog(false)}>Cancel</Button>
                    <Button
                        onClick={handleCreate}
                        variant="contained"
                        color="primary"
                        disabled={loading || !formData.title}
                    >
                        {loading ? <CircularProgress size={24} /> : 'Create'}
                    </Button>
                </DialogActions>
            </Dialog>

            {/* Edit Assessment Dialog */}
            <Dialog open={openEditDialog} onClose={() => setOpenEditDialog(false)} maxWidth="md" fullWidth>
                <DialogTitle>Edit Assessment</DialogTitle>
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
                                rows={4}
                                value={formData.description}
                                onChange={handleFormChange}
                            />
                        </Grid>
                        <Grid item xs={12} sm={4}>
                            <FormControl fullWidth margin="normal">
                                <InputLabel id="type-label">Type</InputLabel>
                                <Select
                                    labelId="type-label"
                                    id="type"
                                    name="type"
                                    value={formData.type}
                                    label="Type"
                                    onChange={handleFormChange}
                                >
                                    <MenuItem value="quiz">Quiz</MenuItem>
                                    <MenuItem value="exam">Exam</MenuItem>
                                    <MenuItem value="assignment">Assignment</MenuItem>
                                </Select>
                            </FormControl>
                        </Grid>
                        <Grid item xs={12} sm={4}>
                            <TextField
                                margin="normal"
                                required
                                fullWidth
                                id="total_points"
                                label="Total Points"
                                name="total_points"
                                type="number"
                                value={formData.total_points}
                                onChange={handleFormChange}
                                InputProps={{ inputProps: { min: 1 } }}
                            />
                        </Grid>
                        <Grid item xs={12} sm={4}>
                            <LocalizationProvider dateAdapter={AdapterDateFns}>
                                <DatePicker
                                    label="Due Date"
                                    value={formData.due_date ? new Date(formData.due_date) : null}
                                    onChange={handleDateChange}
                                    renderInput={(params) =>
                                        <TextField
                                            {...params}
                                            fullWidth
                                            margin="normal"
                                        />
                                    }
                                />
                            </LocalizationProvider>
                        </Grid>
                    </Grid>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setOpenEditDialog(false)}>Cancel</Button>
                    <Button
                        onClick={handleUpdate}
                        variant="contained"
                        color="primary"
                        disabled={loading || !formData.title}
                    >
                        {loading ? <CircularProgress size={24} /> : 'Update'}
                    </Button>
                </DialogActions>
            </Dialog>

            {/* Delete Assessment Dialog */}
            <Dialog open={openDeleteDialog} onClose={() => setOpenDeleteDialog(false)}>
                <DialogTitle>Delete Assessment</DialogTitle>
                <DialogContent>
                    <DialogContentText>
                        Are you sure you want to delete the assessment "{currentAssessment?.title}"?
                        This action cannot be undone and will remove all student submissions.
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

            {/* Submissions Dialog */}
            <Dialog open={openSubmissionsDialog} onClose={() => setOpenSubmissionsDialog(false)} maxWidth="md" fullWidth>
                <DialogTitle>{`Submissions: ${currentAssessment?.title}`}</DialogTitle>
                <DialogContent>
                    <TableContainer>
                        <Table size="small">
                            <TableHead>
                                <TableRow>
                                    <TableCell>Student</TableCell>
                                    <TableCell>Score</TableCell>
                                    <TableCell>Status</TableCell>
                                    <TableCell>Submitted At</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {submissions.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={4} align="center">
                                            No submissions yet
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    submissions.map((submission) => (
                                        <TableRow key={submission.id}>
                                            <TableCell>
                                                {`${submission.student?.first_name} ${submission.student?.last_name}` ||
                                                    `Student ID: ${submission.student_id}`}
                                            </TableCell>
                                            <TableCell>
                                                {submission.score !== null ?
                                                    `${submission.score}/${currentAssessment?.total_points}` :
                                                    'Not graded'}
                                            </TableCell>
                                            <TableCell>
                                                <Chip
                                                    label={submission.status}
                                                    color={
                                                        submission.status === 'graded' ? 'success' :
                                                            submission.status === 'submitted' ? 'primary' :
                                                                submission.status === 'late' ? 'warning' : 'default'
                                                    }
                                                    size="small"
                                                />
                                            </TableCell>
                                            <TableCell>
                                                {new Date(submission.submitted_at).toLocaleString()}
                                            </TableCell>
                                        </TableRow>
                                    ))
                                )}
                            </TableBody>
                        </Table>
                    </TableContainer>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setOpenSubmissionsDialog(false)}>Close</Button>
                </DialogActions>
            </Dialog>

            {/* Add AssessmentSubmission dialog at the bottom of the component */}
            <AssessmentSubmission
                open={openSubmitDialog}
                onClose={() => setOpenSubmitDialog(false)}
                assessment={currentAssessmentForSubmission}
                onSubmitSuccess={() => {
                    setSuccess('Assessment submitted successfully');
                    setTimeout(() => setSuccess(''), 3000);
                }}
            />
        </Container>
    );
};

export default AssessmentManagement; 