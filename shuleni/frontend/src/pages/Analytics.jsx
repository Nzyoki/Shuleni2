import React, { useState, useEffect } from 'react';
import {
    Box,
    Grid,
    Paper,
    Typography,
    CircularProgress,
    Alert,
    Card,
    CardContent,
    CardHeader,
    IconButton,
    MenuItem,
    Select,
    FormControl,
    InputLabel,
} from '@mui/material';
import {
    Refresh as RefreshIcon,
    School as SchoolIcon,
    People as PeopleIcon,
    Class as ClassIcon,
    Assignment as AssignmentIcon,
} from '@mui/icons-material';
import {
    LineChart,
    Line,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    Legend,
    ResponsiveContainer,
    BarChart,
    Bar,
    PieChart,
    Pie,
    Cell,
} from 'recharts';
import { useAuth } from '../contexts/AuthContext';
import { getSchools } from '../services/schools';
import { getClasses } from '../services/classes';
import { getStudents } from '../services/students';
import { getAssessments } from '../services/assessments';

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8'];

const Analytics = () => {
    const { user } = useAuth();
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [timeRange, setTimeRange] = useState('week');
    const [stats, setStats] = useState({
        totalSchools: 0,
        totalUsers: 0,
        totalClasses: 0,
        totalAssessments: 0,
    });
    const [attendanceData, setAttendanceData] = useState([]);
    const [userDistribution, setUserDistribution] = useState([]);
    const [assessmentPerformance, setAssessmentPerformance] = useState([]);

    useEffect(() => {
        fetchAnalytics();
    }, [timeRange]);

    const fetchAnalytics = async () => {
        try {
            setLoading(true);
            setError('');

            // Fetch real data from APIs
            const [schools, classes, students, assessments] = await Promise.all([
                getSchools(),
                getClasses(),
                getStudents(),
                getAssessments(),
            ]);

            console.log('Schools:', schools);
            console.log('Classes:', classes);
            console.log('Students:', students);
            console.log('Assessments:', assessments);

            setStats({
                totalSchools: schools.length,
                totalUsers: students.length, // You can add teachers/admins if needed
                totalClasses: classes.length,
                totalAssessments: assessments.length,
            });

            // Optionally, update userDistribution and other charts with real data
            setUserDistribution([
                { name: 'Students', value: students.length },
                // Add logic to fetch teachers/admins if needed
            ]);

            // Keep demo data for attendance and assessment performance for now
            setAttendanceData([
                { date: 'Mon', attendance: 95 },
                { date: 'Tue', attendance: 92 },
                { date: 'Wed', attendance: 88 },
                { date: 'Thu', attendance: 94 },
                { date: 'Fri', attendance: 90 },
            ]);
            setAssessmentPerformance([
                { subject: 'Math', average: 85 },
                { subject: 'Science', average: 78 },
                { subject: 'English', average: 82 },
                { subject: 'History', average: 75 },
                { subject: 'Geography', average: 80 },
            ]);
        } catch (error) {
            setError('Failed to fetch analytics data');
            console.error('Analytics error:', error);
        } finally {
            setLoading(false);
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
                    Analytics Dashboard
                </Typography>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <FormControl size="small">
                        <InputLabel>Time Range</InputLabel>
                        <Select
                            value={timeRange}
                            label="Time Range"
                            onChange={(e) => setTimeRange(e.target.value)}
                            sx={{ minWidth: 120 }}
                        >
                            <MenuItem value="week">This Week</MenuItem>
                            <MenuItem value="month">This Month</MenuItem>
                            <MenuItem value="year">This Year</MenuItem>
                        </Select>
                    </FormControl>
                    <IconButton onClick={fetchAnalytics} color="primary">
                        <RefreshIcon />
                    </IconButton>
                </Box>
            </Box>

            {error && (
                <Alert severity="error" sx={{ mb: 3 }}>
                    {error}
                </Alert>
            )}

            {/* Stats Cards */}
            <Grid container spacing={3} sx={{ mb: 3 }}>
                <Grid item xs={12} sm={6} md={3}>
                    <Card>
                        <CardContent>
                            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                                <SchoolIcon color="primary" sx={{ mr: 1 }} />
                                <Typography variant="h6">Total Schools</Typography>
                            </Box>
                            <Typography variant="h4">{stats.totalSchools}</Typography>
                        </CardContent>
                    </Card>
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                    <Card>
                        <CardContent>
                            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                                <PeopleIcon color="primary" sx={{ mr: 1 }} />
                                <Typography variant="h6">Total Users</Typography>
                            </Box>
                            <Typography variant="h4">{stats.totalUsers}</Typography>
                        </CardContent>
                    </Card>
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                    <Card>
                        <CardContent>
                            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                                <ClassIcon color="primary" sx={{ mr: 1 }} />
                                <Typography variant="h6">Total Classes</Typography>
                            </Box>
                            <Typography variant="h4">{stats.totalClasses}</Typography>
                        </CardContent>
                    </Card>
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                    <Card>
                        <CardContent>
                            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                                <AssignmentIcon color="primary" sx={{ mr: 1 }} />
                                <Typography variant="h6">Total Assessments</Typography>
                            </Box>
                            <Typography variant="h4">{stats.totalAssessments}</Typography>
                        </CardContent>
                    </Card>
                </Grid>
            </Grid>

            {/* Charts */}
            <Grid container spacing={3}>
                {/* Attendance Trend */}
                <Grid item xs={12} md={8}>
                    <Card>
                        <CardHeader title="Attendance Trend" />
                        <CardContent>
                            <Box sx={{ height: 300 }}>
                                <ResponsiveContainer width="100%" height="100%">
                                    <LineChart data={attendanceData}>
                                        <CartesianGrid strokeDasharray="3 3" />
                                        <XAxis dataKey="date" />
                                        <YAxis domain={[0, 100]} />
                                        <Tooltip />
                                        <Legend />
                                        <Line
                                            type="monotone"
                                            dataKey="attendance"
                                            stroke="#8884d8"
                                            name="Attendance %"
                                        />
                                    </LineChart>
                                </ResponsiveContainer>
                            </Box>
                        </CardContent>
                    </Card>
                </Grid>

                {/* User Distribution */}
                <Grid item xs={12} md={4}>
                    <Card>
                        <CardHeader title="User Distribution" />
                        <CardContent>
                            <Box sx={{ height: 300 }}>
                                <ResponsiveContainer width="100%" height="100%">
                                    <PieChart>
                                        <Pie
                                            data={userDistribution}
                                            dataKey="value"
                                            nameKey="name"
                                            cx="50%"
                                            cy="50%"
                                            outerRadius={80}
                                            label
                                        >
                                            {userDistribution.map((entry, index) => (
                                                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                            ))}
                                        </Pie>
                                        <Tooltip />
                                        <Legend />
                                    </PieChart>
                                </ResponsiveContainer>
                            </Box>
                        </CardContent>
                    </Card>
                </Grid>

                {/* Assessment Performance */}
                <Grid item xs={12}>
                    <Card>
                        <CardHeader title="Assessment Performance by Subject" />
                        <CardContent>
                            <Box sx={{ height: 300 }}>
                                <ResponsiveContainer width="100%" height="100%">
                                    <BarChart data={assessmentPerformance}>
                                        <CartesianGrid strokeDasharray="3 3" />
                                        <XAxis dataKey="subject" />
                                        <YAxis domain={[0, 100]} />
                                        <Tooltip />
                                        <Legend />
                                        <Bar
                                            dataKey="average"
                                            fill="#8884d8"
                                            name="Average Score %"
                                        />
                                    </BarChart>
                                </ResponsiveContainer>
                            </Box>
                        </CardContent>
                    </Card>
                </Grid>
            </Grid>
        </Box>
    );
};

export default Analytics; 