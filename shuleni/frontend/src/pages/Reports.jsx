import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../contexts/AuthContext';
import {
    Container, Typography, Box, Paper, Grid,
    FormControl, InputLabel, MenuItem, Select,
    TextField, Button, CircularProgress, Tabs, Tab,
    Card, CardContent, CardHeader, Divider
} from '@mui/material';
import {
    BarChart, Bar, LineChart, Line, PieChart, Pie,
    XAxis, YAxis, CartesianGrid, Tooltip, Legend,
    ResponsiveContainer, Cell
} from 'recharts';

const Reports = () => {
    const { user } = useAuth();
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [selectedTab, setSelectedTab] = useState(0);
    const [reportData, setReportData] = useState(null);
    const [dateRange, setDateRange] = useState({
        startDate: new Date(new Date().setMonth(new Date().getMonth() - 6)).toISOString().split('T')[0],
        endDate: new Date().toISOString().split('T')[0]
    });

    // Mock data generator
    const generateMockData = useCallback(() => {
        // Performance data
        const subjects = ['Mathematics', 'English', 'Science', 'History', 'Geography', 'Art'];
        const performanceData = subjects.map(subject => ({
            name: subject,
            average: Math.floor(Math.random() * 30) + 60,
            highest: Math.floor(Math.random() * 20) + 80,
            lowest: Math.floor(Math.random() * 30) + 40,
        }));

        // Student data
        const studentData = [
            { name: 'Active', value: Math.floor(Math.random() * 200) + 300 },
            { name: 'Inactive', value: Math.floor(Math.random() * 30) + 10 },
            { name: 'New', value: Math.floor(Math.random() * 40) + 20 },
        ];

        // Attendance data
        const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
        const attendanceData = months.map(month => ({
            name: month,
            present: Math.floor(Math.random() * 20) + 80,
            absent: Math.floor(Math.random() * 15),
            late: Math.floor(Math.random() * 10),
        }));

        // Classes data
        const classData = [
            { name: 'Class 1', students: Math.floor(Math.random() * 15) + 25 },
            { name: 'Class 2', students: Math.floor(Math.random() * 15) + 25 },
            { name: 'Class 3', students: Math.floor(Math.random() * 15) + 25 },
            { name: 'Class 4', students: Math.floor(Math.random() * 15) + 25 },
            { name: 'Class 5', students: Math.floor(Math.random() * 15) + 25 },
        ];

        // Trends data
        const trendData = months.map(month => ({
            name: month,
            performance: Math.floor(Math.random() * 30) + 60,
            attendance: Math.floor(Math.random() * 15) + 80,
        }));

        return {
            performance: performanceData,
            students: studentData,
            attendance: attendanceData,
            classes: classData,
            trends: trendData,
            summary: {
                totalStudents: studentData.reduce((acc, curr) => acc + curr.value, 0),
                averageAttendance: Math.floor(Math.random() * 10) + 85,
                averagePerformance: Math.floor(Math.random() * 15) + 70,
                totalClasses: classData.length,
            }
        };
    }, []);

    useEffect(() => {
        // Generate mock data on component mount
        const mockData = generateMockData();
        setReportData(mockData);
        setLoading(false);
    }, [generateMockData]);

    const handleTabChange = (event, newValue) => {
        setSelectedTab(newValue);
    };

    const handleDateChange = (e) => {
        const { name, value } = e.target;
        setDateRange(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const refreshData = () => {
            setLoading(true);
        setTimeout(() => {
            const mockData = generateMockData();
            setReportData(mockData);
            setLoading(false);
        }, 800);
    };

    const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d'];

    if (loading) {
        return (
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '70vh' }}>
                <CircularProgress />
            </Box>
        );
    }

    return (
        <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
            <Grid container spacing={3} justifyContent="space-between" alignItems="center" mb={3}>
                <Grid item>
                    <Typography variant="h4" component="h1">
                        Analytics Dashboard
                    </Typography>
                </Grid>
                <Grid item>
                    <Box display="flex" gap={2}>
                        <TextField
                            label="From"
                            type="date"
                            name="startDate"
                            value={dateRange.startDate}
                            onChange={handleDateChange}
                            sx={{ width: 170 }}
                            InputLabelProps={{ shrink: true }}
                        />
                        <TextField
                            label="To"
                            type="date"
                            name="endDate"
                            value={dateRange.endDate}
                            onChange={handleDateChange}
                            sx={{ width: 170 }}
                            InputLabelProps={{ shrink: true }}
                        />
                        <Button
                            variant="contained"
                            onClick={refreshData}
                            disabled={loading}
                        >
                            Refresh Data
                        </Button>
                    </Box>
                </Grid>
            </Grid>

            {error && (
                <Box sx={{ mb: 3 }}>
                    <Alert severity="error">{error}</Alert>
                </Box>
            )}

            {reportData && (
                <>
                    {/* Summary Cards */}
                    <Grid container spacing={3} mb={4}>
                        <Grid item xs={12} sm={6} md={3}>
                            <Card>
                                <CardContent>
                                    <Typography color="textSecondary" gutterBottom>
                                        Total Students
                                    </Typography>
                                    <Typography variant="h4">
                                        {reportData.summary.totalStudents}
                                    </Typography>
                                </CardContent>
                            </Card>
                        </Grid>
                        <Grid item xs={12} sm={6} md={3}>
                            <Card>
                                <CardContent>
                                    <Typography color="textSecondary" gutterBottom>
                                        Average Attendance
                                    </Typography>
                                    <Typography variant="h4">
                                        {reportData.summary.averageAttendance}%
                                    </Typography>
                                </CardContent>
                            </Card>
                        </Grid>
                        <Grid item xs={12} sm={6} md={3}>
                            <Card>
                                <CardContent>
                                    <Typography color="textSecondary" gutterBottom>
                                        Average Performance
                                    </Typography>
                                    <Typography variant="h4">
                                        {reportData.summary.averagePerformance}%
                                    </Typography>
                                </CardContent>
                            </Card>
                        </Grid>
                        <Grid item xs={12} sm={6} md={3}>
                            <Card>
                                <CardContent>
                                    <Typography color="textSecondary" gutterBottom>
                                        Total Classes
                                    </Typography>
                                    <Typography variant="h4">
                                        {reportData.summary.totalClasses}
                                    </Typography>
                                </CardContent>
                            </Card>
                        </Grid>
                    </Grid>

                    {/* Tabs */}
                    <Paper sx={{ width: '100%', mb: 4 }}>
                        <Tabs
                            value={selectedTab}
                            onChange={handleTabChange}
                            indicatorColor="primary"
                            textColor="primary"
                            variant="fullWidth"
                        >
                            <Tab label="Performance" />
                            <Tab label="Students" />
                            <Tab label="Classes" />
                            <Tab label="Trends" />
                        </Tabs>

                        <Box p={3}>
                            {/* Performance Tab */}
                            {selectedTab === 0 && (
                                <Grid container spacing={3}>
                                    <Grid item xs={12}>
                                        <Typography variant="h6" mb={2}>Subject Performance</Typography>
                                        <ResponsiveContainer width="100%" height={400}>
                                            <BarChart
                                                data={reportData.performance}
                                                margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                                            >
                                                <CartesianGrid strokeDasharray="3 3" />
                                                <XAxis dataKey="name" />
                                                <YAxis />
                                                <Tooltip />
                                                <Legend />
                                                <Bar dataKey="average" fill="#8884d8" name="Average Score" />
                                                <Bar dataKey="highest" fill="#82ca9d" name="Highest Score" />
                                                <Bar dataKey="lowest" fill="#ffc658" name="Lowest Score" />
                                            </BarChart>
                                        </ResponsiveContainer>
                                    </Grid>
                                </Grid>
                            )}

                            {/* Students Tab */}
                            {selectedTab === 1 && (
                                <Grid container spacing={3}>
                                    <Grid item xs={12} md={6}>
                                        <Typography variant="h6" mb={2}>Student Distribution</Typography>
                                        <ResponsiveContainer width="100%" height={300}>
                                            <PieChart>
                                                <Pie
                                                    data={reportData.students}
                                                    cx="50%"
                                                    cy="50%"
                                                    labelLine={false}
                                                    label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                                                    outerRadius={100}
                                                    fill="#8884d8"
                                                    dataKey="value"
                                                >
                                                    {reportData.students.map((entry, index) => (
                                                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                                    ))}
                                                </Pie>
                                                <Tooltip formatter={(value) => value} />
                                                <Legend />
                                            </PieChart>
                                        </ResponsiveContainer>
                                    </Grid>
                                    <Grid item xs={12} md={6}>
                                        <Typography variant="h6" mb={2}>Monthly Attendance</Typography>
                                        <ResponsiveContainer width="100%" height={300}>
                                            <BarChart
                                                data={reportData.attendance.slice(0, 6)}
                                                margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                                            >
                                                <CartesianGrid strokeDasharray="3 3" />
                                                <XAxis dataKey="name" />
                                                <YAxis />
                                                <Tooltip />
                                                <Legend />
                                                <Bar dataKey="present" stackId="a" fill="#82ca9d" name="Present" />
                                                <Bar dataKey="absent" stackId="a" fill="#ff8042" name="Absent" />
                                                <Bar dataKey="late" stackId="a" fill="#8884d8" name="Late" />
                                            </BarChart>
                                        </ResponsiveContainer>
                                    </Grid>
                                </Grid>
                            )}

                            {/* Classes Tab */}
                            {selectedTab === 2 && (
                                <Grid container spacing={3}>
                                    <Grid item xs={12}>
                                        <Typography variant="h6" mb={2}>Class Size Distribution</Typography>
                                        <ResponsiveContainer width="100%" height={400}>
                                            <BarChart
                                                data={reportData.classes}
                                                margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                                            >
                                                <CartesianGrid strokeDasharray="3 3" />
                                                <XAxis dataKey="name" />
                                                <YAxis />
                                                <Tooltip />
                                                <Legend />
                                                <Bar dataKey="students" fill="#8884d8" name="Number of Students" />
                                            </BarChart>
                                        </ResponsiveContainer>
                                    </Grid>
                                </Grid>
                            )}

                            {/* Trends Tab */}
                            {selectedTab === 3 && (
                                <Grid container spacing={3}>
                                    <Grid item xs={12}>
                                        <Typography variant="h6" mb={2}>Performance & Attendance Trends</Typography>
                                        <ResponsiveContainer width="100%" height={400}>
                                            <LineChart
                                                data={reportData.trends}
                                                margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                                            >
                                                <CartesianGrid strokeDasharray="3 3" />
                                                <XAxis dataKey="name" />
                                                <YAxis />
                                                <Tooltip />
                                                <Legend />
                                                <Line type="monotone" dataKey="performance" stroke="#8884d8" name="Average Performance %" activeDot={{ r: 8 }} />
                                                <Line type="monotone" dataKey="attendance" stroke="#82ca9d" name="Attendance %" />
                                            </LineChart>
                                        </ResponsiveContainer>
                                    </Grid>
                                </Grid>
                            )}
                        </Box>
                    </Paper>
                </>
            )}
        </Container>
    );
};

export default Reports; 