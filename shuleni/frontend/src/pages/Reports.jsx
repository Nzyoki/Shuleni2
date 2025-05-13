import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { getAnalytics, getPerformanceReport } from '../services/reports';
import {
    Container,
    Typography,
    Box,
    Paper,
    Select,
    MenuItem,
    InputLabel,
    FormControl,
    Grid,
    Button,
    TextField,
    CircularProgress,
    Alert,
    Tabs,
    Tab
} from '@mui/material';

const Reports = () => {
    const { user } = useAuth();
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [selectedReport, setSelectedReport] = useState('performance');
    const [reportData, setReportData] = useState(null);
    const [activeTab, setActiveTab] = useState(0);
    const [dateRange, setDateRange] = useState({
        startDate: new Date(new Date().setMonth(new Date().getMonth() - 1)).toISOString().split('T')[0],
        endDate: new Date().toISOString().split('T')[0]
    });

    const fetchData = useCallback(async () => {
        setLoading(true);
        setError('');

        try {
            // Fetch analytics data from API
            const analyticsData = await getAnalytics(selectedReport, dateRange);
            setReportData(analyticsData);
        } catch (err) {
            console.error('Error loading analytics:', err);
            setError('Failed to load analytics data. ' + (err.message || ''));

            // Fall back to mock data if API fails
            generateMockData();
        } finally {
            setLoading(false);
        }
    }, [selectedReport, dateRange]);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    const handleTabChange = (event, newValue) => {
        setActiveTab(newValue);
    };

    const handleReportChange = (e) => {
        setSelectedReport(e.target.value);
    };

    const handleDateChange = (e) => {
        const { name, value } = e.target;
        setDateRange(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const generateReport = async () => {
        await fetchData();
    };

    // Fallback to generate mock data if API fails
    const generateMockData = () => {
        const data = {
            report_type: selectedReport,
            date_range: dateRange,
            summary: {
                total_schools: user.role === 'super_admin' ? 5 : 1,
                total_students: user.role === 'super_admin' ? 1250 : 350,
                total_classes: user.role === 'super_admin' ? 45 : 12,
                average_performance: 78,
                attendance_rate: 92
            },
            performance: {
                title: user.role === 'super_admin' ? 'System-wide Performance' : 'School Performance',
                labels: ['Term 1', 'Term 2', 'Term 3'],
                datasets: [
                    {
                        label: 'Average Score',
                        data: [75, 82, 78],
                        backgroundColor: '#4CAF50'
                    }
                ]
            },
            students: {
                title: user.role === 'super_admin' ? 'All Students Overview' : `Students in ${user.school_name || 'Your School'}`,
                total: user.role === 'super_admin' ? 1250 : 350,
                active: user.role === 'super_admin' ? 1180 : 330,
                growth: user.role === 'super_admin' ? '+12%' : '+8%'
            }
        };

        setReportData(data);
    };

    if (loading) {
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
                        {user.role === 'super_admin' ? 'System Analytics' : 'School Analytics'}
                    </Typography>
                </Box>

            {error && (
                    <Alert severity="error" sx={{ mb: 3 }}>
                        {error}
                    </Alert>
                )}

                <Tabs value={activeTab} onChange={handleTabChange} sx={{ mb: 3 }}>
                    <Tab label="Performance" />
                    <Tab label="Students" />
                    <Tab label="Classes" />
                    <Tab label="Trends" />
                </Tabs>

                <Box sx={{ mb: 3 }}>
                    <Grid container spacing={2}>
                        <Grid item xs={12} md={4}>
                            <FormControl fullWidth>
                                <InputLabel id="report-type-label">Report Type</InputLabel>
                                <Select
                                    labelId="report-type-label"
                                    id="report-type"
                            value={selectedReport}
                                    label="Report Type"
                            onChange={handleReportChange}
                        >
                                    <MenuItem value="performance">Performance Analytics</MenuItem>
                                    <MenuItem value="attendance">Attendance Statistics</MenuItem>
                                    <MenuItem value="enrollment">Enrollment Trends</MenuItem>
                                    {user.role === 'super_admin' && (
                                        <MenuItem value="financial">Financial Reports</MenuItem>
                                    )}
                                </Select>
                            </FormControl>
                        </Grid>
                        <Grid item xs={6} md={3}>
                            <TextField
                                fullWidth
                                label="Start Date"
                                type="date"
                                name="startDate"
                                value={dateRange.startDate}
                                onChange={handleDateChange}
                                InputLabelProps={{ shrink: true }}
                            />
                        </Grid>
                        <Grid item xs={6} md={3}>
                            <TextField
                                fullWidth
                                label="End Date"
                                type="date"
                                name="endDate"
                                value={dateRange.endDate}
                                onChange={handleDateChange}
                                InputLabelProps={{ shrink: true }}
                            />
                        </Grid>
                        <Grid item xs={12} md={2}>
                            <Button
                                fullWidth
                                variant="contained"
                        onClick={generateReport}
                                sx={{ height: '56px' }}
                            >
                                Generate
                            </Button>
                        </Grid>
                    </Grid>
                </Box>

                {reportData && (
                    <Box>
                        <Typography variant="h5" gutterBottom>
                            {reportData[selectedReport]?.title || (reportData.report_type === selectedReport ?
                                `${selectedReport.charAt(0).toUpperCase() + selectedReport.slice(1)} Report` :
                                'Report Results')}
                        </Typography>
                        <Box sx={{ bgcolor: 'background.paper', p: 3, borderRadius: 1, minHeight: '300px' }}>
                            {activeTab === 0 && (
                                <Box>
                                    <Typography variant="h6">Performance Overview</Typography>
                                    {reportData.summary && (
                                        <Grid container spacing={3} sx={{ mt: 1 }}>
                                            <Grid item xs={12} md={4}>
                                                <Paper sx={{ p: 2, textAlign: 'center' }}>
                                                    <Typography variant="h4">{reportData.summary.average_performance}%</Typography>
                                                    <Typography variant="body1">Average Performance</Typography>
                                                </Paper>
                                            </Grid>
                                            <Grid item xs={12} md={4}>
                                                <Paper sx={{ p: 2, textAlign: 'center' }}>
                                                    <Typography variant="h4">{reportData.summary.total_classes}</Typography>
                                                    <Typography variant="body1">Classes</Typography>
                                                </Paper>
                                            </Grid>
                                            <Grid item xs={12} md={4}>
                                                <Paper sx={{ p: 2, textAlign: 'center' }}>
                                                    <Typography variant="h4">{reportData.summary.attendance_rate}%</Typography>
                                                    <Typography variant="body1">Attendance Rate</Typography>
                                                </Paper>
                                            </Grid>
                                        </Grid>
                                    )}
                                </Box>
                            )}

                            {activeTab === 1 && (
                                <Box>
                                    <Typography variant="h6">Student Overview</Typography>
                                    {reportData.summary && (
                                        <Grid container spacing={3} sx={{ mt: 1 }}>
                                            <Grid item xs={12} md={6}>
                                                <Paper sx={{ p: 2, textAlign: 'center' }}>
                                                    <Typography variant="h4">{reportData.summary.total_students}</Typography>
                                                    <Typography variant="body1">Total Students</Typography>
                                                </Paper>
                                            </Grid>
                                            <Grid item xs={12} md={6}>
                                                <Paper sx={{ p: 2, textAlign: 'center' }}>
                                                    <Typography variant="h4">{user.role === 'super_admin' ? reportData.summary.total_schools : 1}</Typography>
                                                    <Typography variant="body1">{user.role === 'super_admin' ? 'Schools' : 'School'}</Typography>
                                                </Paper>
                                            </Grid>
                                        </Grid>
                                    )}
                                </Box>
                            )}

                            {activeTab === 2 && (
                                <Box>
                                    <Typography variant="h6">Classes Analytics</Typography>
                                    {reportData.classes ? (
                                        <Grid container spacing={2} sx={{ mt: 1 }}>
                                            {reportData.classes.map((classItem, index) => (
                                                <Grid item xs={12} sm={6} md={4} key={index}>
                                                    <Paper sx={{ p: 2 }}>
                                                        <Typography variant="h6">{classItem.name}</Typography>
                                                        <Typography>Performance: {classItem.performance}%</Typography>
                                                        <Typography>Attendance: {classItem.attendance}%</Typography>
                                                        <Typography>Students: {classItem.student_count}</Typography>
                                                    </Paper>
                                                </Grid>
                                            ))}
                                        </Grid>
                                    ) : (
                                        <Typography variant="body1" sx={{ mt: 2 }}>
                                            {user.role === 'super_admin'
                                                ? 'Showing metrics for all classes across all schools.'
                                                : 'Showing metrics for all classes in your school.'}
                                        </Typography>
                                    )}
                                </Box>
                            )}

                            {activeTab === 3 && (
                                <Box>
                                    <Typography variant="h6">Trend Analysis</Typography>
                                    <Typography variant="body1" sx={{ mt: 2 }}>
                                        {user.role === 'super_admin'
                                            ? 'Showing long-term trends across the entire system.'
                                            : 'Showing long-term trends for your school.'}
                                    </Typography>
                                </Box>
                            )}
                        </Box>
                    </Box>
                )}
            </Paper>
        </Container>
    );
};

export default Reports; 