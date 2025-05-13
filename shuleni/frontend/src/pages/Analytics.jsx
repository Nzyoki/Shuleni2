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
    Tabs,
    Tab,
    Divider,
    Chip,
    Tooltip as MuiTooltip,
    useTheme,
} from '@mui/material';
import {
    Refresh as RefreshIcon,
    School as SchoolIcon,
    People as PeopleIcon,
    Class as ClassIcon,
    Assignment as AssignmentIcon,
    TrendingUp as TrendingUpIcon,
    Person as PersonIcon,
    WbSunny as SunnyIcon,
    Female as FemaleIcon,
    Male as MaleIcon,
    Book as BookIcon,
    Timeline as TimelineIcon,
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
    AreaChart,
    Area,
    RadarChart,
    PolarGrid,
    PolarAngleAxis,
    PolarRadiusAxis,
    Radar,
    ComposedChart,
    Scatter,
} from 'recharts';
import { useAuth } from '../contexts/AuthContext';
import { getSchools } from '../services/schools';
import { getClasses } from '../services/classes';
import { getStudents } from '../services/students';
import { getAssessments } from '../services/assessments';

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d', '#ffc658', '#ff7300'];

// Custom component for stat card
const StatCard = ({ icon, title, value, subtitle, color }) => (
    <Card
        elevation={3}
        sx={{
            height: '100%',
            background: `linear-gradient(135deg, ${color}22 0%, white 100%)`,
            border: `1px solid ${color}33`,
            transition: 'all 0.3s ease',
            '&:hover': {
                transform: 'translateY(-5px)',
                boxShadow: '0 10px 20px rgba(0,0,0,0.1)',
            }
        }}
    >
        <CardContent>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Typography variant="h6" fontWeight="500" color="text.secondary">
                    {title}
                </Typography>
                <Box sx={{
                    backgroundColor: `${color}22`,
                    borderRadius: '50%',
                    p: 1,
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center'
                }}>
                    {icon}
                </Box>
            </Box>
            <Typography variant="h3" fontWeight="bold" sx={{ mb: 1 }}>
                {value}
            </Typography>
            {subtitle && (
                <Typography variant="body2" color="text.secondary">
                    {subtitle}
                </Typography>
            )}
        </CardContent>
    </Card>
);

const Analytics = () => {
    const { user } = useAuth();
    const theme = useTheme();
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [timeRange, setTimeRange] = useState('week');
    const [tabValue, setTabValue] = useState(0);
    const [stats, setStats] = useState({
        totalSchools: 0,
        totalUsers: 0,
        totalClasses: 0,
        totalAssessments: 0,
        activeUsers: 0,
        completionRate: 0,
    });

    // Data states
    const [attendanceData, setAttendanceData] = useState([]);
    const [userDistribution, setUserDistribution] = useState([]);
    const [assessmentPerformance, setAssessmentPerformance] = useState([]);
    const [genderDistribution, setGenderDistribution] = useState([]);
    const [classPerformance, setClassPerformance] = useState([]);
    const [monthlyTrends, setMonthlyTrends] = useState([]);
    const [skillRadarData, setSkillRadarData] = useState([]);
    const [gradeDistribution, setGradeDistribution] = useState([]);

    useEffect(() => {
        fetchAnalytics();
    }, [timeRange]);

    const handleChangeTab = (event, newValue) => {
        setTabValue(newValue);
    };

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

            setStats({
                totalSchools: schools?.length || 0,
                totalUsers: students?.length || 0,
                totalClasses: classes?.length || 0,
                totalAssessments: assessments?.length || 0,
                activeUsers: Math.floor((students?.length || 0) * 0.85), // Mock data - 85% active
                completionRate: 78, // Mock completion rate
            });

            // Set up user distribution with real data and some mocked categories
            setUserDistribution([
                { name: 'Students', value: students?.length || 0 },
                { name: 'Teachers', value: Math.ceil((students?.length || 0) * 0.1) }, // Mock: 1 teacher per 10 students
                { name: 'Admins', value: schools?.length || 0 }, // Assume 1 admin per school
            ]);

            // Mock gender distribution - adjust with real data when available
            setGenderDistribution([
                { name: 'Male', value: Math.floor((students?.length || 0) * 0.52) },
                { name: 'Female', value: Math.ceil((students?.length || 0) * 0.48) },
            ]);

            // Mock attendance data
            setAttendanceData([
                { date: 'Mon', attendance: 95, target: 100 },
                { date: 'Tue', attendance: 92, target: 100 },
                { date: 'Wed', attendance: 88, target: 100 },
                { date: 'Thu', attendance: 94, target: 100 },
                { date: 'Fri', attendance: 90, target: 100 },
            ]);

            // Mock assessment performance
            setAssessmentPerformance([
                { subject: 'Math', average: 85, highest: 98, lowest: 65 },
                { subject: 'Science', average: 78, highest: 95, lowest: 62 },
                { subject: 'English', average: 82, highest: 97, lowest: 68 },
                { subject: 'History', average: 75, highest: 90, lowest: 58 },
                { subject: 'Geography', average: 80, highest: 92, lowest: 64 },
            ]);

            // Mock class performance comparison
            setClassPerformance([
                { name: 'Class A', math: 88, english: 82, science: 90 },
                { name: 'Class B', math: 75, english: 80, science: 85 },
                { name: 'Class C', math: 82, english: 78, science: 72 },
                { name: 'Class D', math: 90, english: 85, science: 88 },
            ]);

            // Mock monthly trends
            setMonthlyTrends([
                { month: 'Jan', students: 120, classes: 8, assessments: 15 },
                { month: 'Feb', students: 132, classes: 9, assessments: 18 },
                { month: 'Mar', students: 145, classes: 10, assessments: 22 },
                { month: 'Apr', students: 150, classes: 10, assessments: 25 },
                { month: 'May', students: 170, classes: 12, assessments: 30 },
                { month: 'Jun', students: 180, classes: 12, assessments: 28 },
            ]);

            // Mock skill radar data
            setSkillRadarData([
                { subject: 'Math', A: 85, B: 70, fullMark: 100 },
                { subject: 'English', A: 75, B: 80, fullMark: 100 },
                { subject: 'Science', A: 90, B: 75, fullMark: 100 },
                { subject: 'History', A: 65, B: 85, fullMark: 100 },
                { subject: 'Arts', A: 70, B: 60, fullMark: 100 },
                { subject: 'Physics', A: 80, B: 70, fullMark: 100 },
            ]);

            // Mock grade distribution
            setGradeDistribution([
                { name: 'A', value: Math.floor((students?.length || 100) * 0.12) },
                { name: 'B', value: Math.floor((students?.length || 100) * 0.28) },
                { name: 'C', value: Math.floor((students?.length || 100) * 0.35) },
                { name: 'D', value: Math.floor((students?.length || 100) * 0.18) },
                { name: 'F', value: Math.floor((students?.length || 100) * 0.07) },
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
                <Box>
                <Typography variant="h4" component="h1" sx={{ fontWeight: 'bold' }}>
                    Analytics Dashboard
                </Typography>
                    <Typography color="text.secondary" variant="subtitle1">
                        Get insights into your school's performance
                    </Typography>
                </Box>
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
                            <MenuItem value="quarter">This Quarter</MenuItem>
                            <MenuItem value="year">This Year</MenuItem>
                        </Select>
                    </FormControl>
                    <IconButton
                        onClick={fetchAnalytics}
                        color="primary"
                        sx={{
                            bgcolor: theme.palette.primary.main + '22',
                            '&:hover': { bgcolor: theme.palette.primary.main + '33' }
                        }}
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

            {/* Stats Cards */}
            <Grid container spacing={3} sx={{ mb: 4 }}>
                <Grid item xs={12} sm={6} md={3}>
                    <StatCard
                        icon={<SchoolIcon sx={{ color: theme.palette.primary.main }} />}
                        title="Total Schools"
                        value={stats.totalSchools}
                        subtitle="Schools in the system"
                        color={theme.palette.primary.main}
                    />
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                    <StatCard
                        icon={<PeopleIcon sx={{ color: theme.palette.secondary.main }} />}
                        title="Total Users"
                        value={stats.totalUsers}
                        subtitle={`${stats.activeUsers} active users`}
                        color={theme.palette.secondary.main}
                    />
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                    <StatCard
                        icon={<ClassIcon sx={{ color: theme.palette.success.main }} />}
                        title="Total Classes"
                        value={stats.totalClasses}
                        subtitle="Active classes"
                        color={theme.palette.success.main}
                    />
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                    <StatCard
                        icon={<AssignmentIcon sx={{ color: theme.palette.warning.main }} />}
                        title="Assessments"
                        value={stats.totalAssessments}
                        subtitle={`${stats.completionRate}% completion rate`}
                        color={theme.palette.warning.main}
                    />
                </Grid>
            </Grid>

            <Tabs
                value={tabValue}
                onChange={handleChangeTab}
                centered
                sx={{
                    mb: 3,
                    '& .MuiTabs-indicator': {
                        height: 3,
                        borderRadius: '3px 3px 0 0'
                    }
                }}
            >
                <Tab
                    icon={<TrendingUpIcon />}
                    label="Performance"
                    iconPosition="start"
                />
                <Tab
                    icon={<PersonIcon />}
                    label="Students"
                    iconPosition="start"
                />
                <Tab
                    icon={<ClassIcon />}
                    label="Classes"
                    iconPosition="start"
                />
                <Tab
                    icon={<TimelineIcon />}
                    label="Trends"
                    iconPosition="start"
                />
            </Tabs>

            {/* Tab 1: Performance Overview */}
            {tabValue === 0 && (
            <Grid container spacing={3}>
                    {/* Assessment Performance */}
                <Grid item xs={12} md={8}>
                        <Card elevation={3}>
                            <CardHeader
                                title="Subject Performance Analysis"
                                subheader="Average, highest and lowest scores by subject"
                            />
                            <Divider />
                        <CardContent>
                                <Box sx={{ height: 350 }}>
                                <ResponsiveContainer width="100%" height="100%">
                                        <ComposedChart data={assessmentPerformance}>
                                        <CartesianGrid strokeDasharray="3 3" />
                                            <XAxis dataKey="subject" />
                                        <YAxis domain={[0, 100]} />
                                        <Tooltip />
                                        <Legend />
                                            <Bar dataKey="average" fill={theme.palette.primary.main} name="Average Score" />
                                            <Line type="monotone" dataKey="highest" stroke={theme.palette.success.main} name="Highest Score" />
                                            <Line type="monotone" dataKey="lowest" stroke={theme.palette.error.main} name="Lowest Score" />
                                        </ComposedChart>
                                    </ResponsiveContainer>
                                </Box>
                            </CardContent>
                        </Card>
                    </Grid>

                    {/* Grade Distribution */}
                    <Grid item xs={12} md={4}>
                        <Card elevation={3}>
                            <CardHeader
                                title="Grade Distribution"
                                subheader="Overall student grades"
                            />
                            <Divider />
                            <CardContent>
                                <Box sx={{ height: 350, display: 'flex', justifyContent: 'center' }}>
                                    <ResponsiveContainer width="100%" height="100%">
                                        <PieChart>
                                            <Pie
                                                data={gradeDistribution}
                                                dataKey="value"
                                                nameKey="name"
                                                cx="50%"
                                                cy="50%"
                                                outerRadius={100}
                                                labelLine={true}
                                                label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                                            >
                                                {gradeDistribution.map((entry, index) => (
                                                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                                ))}
                                            </Pie>
                                            <Tooltip formatter={(value) => [`${value} students`, 'Count']} />
                                        </PieChart>
                                </ResponsiveContainer>
                            </Box>
                        </CardContent>
                    </Card>
                </Grid>

                    {/* Skill Comparison */}
                    <Grid item xs={12}>
                        <Card elevation={3}>
                            <CardHeader
                                title="Skills Comparison"
                                subheader="Class A vs Class B performance across subjects"
                            />
                            <Divider />
                            <CardContent>
                                <Box sx={{ height: 400 }}>
                                    <ResponsiveContainer width="100%" height="100%">
                                        <RadarChart outerRadius={150} data={skillRadarData}>
                                            <PolarGrid />
                                            <PolarAngleAxis dataKey="subject" />
                                            <PolarRadiusAxis angle={30} domain={[0, 100]} />
                                            <Radar name="Class A" dataKey="A" stroke={theme.palette.primary.main} fill={theme.palette.primary.main} fillOpacity={0.6} />
                                            <Radar name="Class B" dataKey="B" stroke={theme.palette.secondary.main} fill={theme.palette.secondary.main} fillOpacity={0.6} />
                                            <Legend />
                                            <Tooltip />
                                        </RadarChart>
                                    </ResponsiveContainer>
                                </Box>
                            </CardContent>
                        </Card>
                    </Grid>
                </Grid>
            )}

            {/* Tab 2: Students Overview */}
            {tabValue === 1 && (
                <Grid container spacing={3}>
                {/* User Distribution */}
                    <Grid item xs={12} md={6}>
                        <Card elevation={3}>
                            <CardHeader
                                title="User Categories"
                                subheader="Distribution of users by role"
                            />
                            <Divider />
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
                                                outerRadius={100}
                                                label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                                        >
                                            {userDistribution.map((entry, index) => (
                                                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                            ))}
                                        </Pie>
                                            <Tooltip formatter={(value) => [`${value} users`, 'Count']} />
                                        <Legend />
                                    </PieChart>
                                </ResponsiveContainer>
                            </Box>
                        </CardContent>
                    </Card>
                </Grid>

                    {/* Gender Distribution */}
                    <Grid item xs={12} md={6}>
                        <Card elevation={3}>
                            <CardHeader
                                title="Gender Distribution"
                                subheader="Students by gender"
                            />
                            <Divider />
                        <CardContent>
                            <Box sx={{ height: 300 }}>
                                <ResponsiveContainer width="100%" height="100%">
                                        <BarChart data={genderDistribution}>
                                        <CartesianGrid strokeDasharray="3 3" />
                                            <XAxis dataKey="name" />
                                            <YAxis />
                                            <Tooltip formatter={(value) => [`${value} students`, 'Count']} />
                                        <Legend />
                                        <Bar
                                                dataKey="value"
                                                name="Students"
                                                fill={theme.palette.primary.main}
                                                shape={(props) => {
                                                    const { x, y, width, height, name } = props;
                                                    return (
                                                        <g>
                                                            <rect x={x} y={y} width={width} height={height} fill={props.name === 'Male' ? '#0088FE' : '#FF69B4'} />
                                                            {props.name === 'Male' ?
                                                                <MaleIcon style={{ fill: 'white', x: x + width / 2 - 12, y: y + height / 2 - 12, width: 24, height: 24 }} /> :
                                                                <FemaleIcon style={{ fill: 'white', x: x + width / 2 - 12, y: y + height / 2 - 12, width: 24, height: 24 }} />
                                                            }
                                                        </g>
                                                    );
                                                }}
                                        />
                                    </BarChart>
                                </ResponsiveContainer>
                            </Box>
                        </CardContent>
                    </Card>
                </Grid>

                    {/* Student Attendance */}
                    <Grid item xs={12}>
                        <Card elevation={3}>
                            <CardHeader
                                title="Weekly Attendance Rate"
                                subheader="Daily attendance percentage"
                            />
                            <Divider />
                            <CardContent>
                                <Box sx={{ height: 350 }}>
                                    <ResponsiveContainer width="100%" height="100%">
                                        <AreaChart data={attendanceData}>
                                            <CartesianGrid strokeDasharray="3 3" />
                                            <XAxis dataKey="date" />
                                            <YAxis domain={[50, 100]} />
                                            <Tooltip />
                                            <Legend />
                                            <Area
                                                type="monotone"
                                                dataKey="attendance"
                                                stroke={theme.palette.primary.main}
                                                fill={theme.palette.primary.main}
                                                fillOpacity={0.3}
                                                name="Attendance %"
                                            />
                                            <Line
                                                type="monotone"
                                                dataKey="target"
                                                stroke={theme.palette.success.main}
                                                strokeDasharray="5 5"
                                                name="Target %"
                                            />
                                        </AreaChart>
                                    </ResponsiveContainer>
                                </Box>
                            </CardContent>
                        </Card>
                    </Grid>
                </Grid>
            )}

            {/* Tab 3: Classes Overview */}
            {tabValue === 2 && (
                <Grid container spacing={3}>
                    {/* Class Performance Comparison */}
                    <Grid item xs={12}>
                        <Card elevation={3}>
                            <CardHeader
                                title="Class Performance Comparison"
                                subheader="Average scores by class and subject"
                            />
                            <Divider />
                            <CardContent>
                                <Box sx={{ height: 400 }}>
                                    <ResponsiveContainer width="100%" height="100%">
                                        <BarChart data={classPerformance}>
                                            <CartesianGrid strokeDasharray="3 3" />
                                            <XAxis dataKey="name" />
                                            <YAxis domain={[0, 100]} />
                                            <Tooltip />
                                            <Legend />
                                            <Bar dataKey="math" fill="#8884d8" name="Mathematics" />
                                            <Bar dataKey="english" fill="#82ca9d" name="English" />
                                            <Bar dataKey="science" fill="#ffc658" name="Science" />
                                        </BarChart>
                                    </ResponsiveContainer>
                                </Box>
                            </CardContent>
                        </Card>
                    </Grid>

                    {/* More class-specific charts could be added here */}
                </Grid>
            )}

            {/* Tab 4: Trends Overview */}
            {tabValue === 3 && (
                <Grid container spacing={3}>
                    {/* Monthly Trends */}
                    <Grid item xs={12}>
                        <Card elevation={3}>
                            <CardHeader
                                title="Growth Trends"
                                subheader="Monthly progression of key metrics"
                            />
                            <Divider />
                            <CardContent>
                                <Box sx={{ height: 400 }}>
                                    <ResponsiveContainer width="100%" height="100%">
                                        <ComposedChart data={monthlyTrends}>
                                            <CartesianGrid strokeDasharray="3 3" />
                                            <XAxis dataKey="month" />
                                            <YAxis yAxisId="left" />
                                            <YAxis yAxisId="right" orientation="right" />
                                            <Tooltip />
                                            <Legend />
                                            <Area
                                                yAxisId="left"
                                                type="monotone"
                                                dataKey="students"
                                                fill={theme.palette.primary.main}
                                                stroke={theme.palette.primary.main}
                                                fillOpacity={0.3}
                                                name="Students"
                                            />
                                            <Bar
                                                yAxisId="right"
                                                dataKey="classes"
                                                fill={theme.palette.secondary.main}
                                                name="Classes"
                                            />
                                            <Line
                                                yAxisId="right"
                                                type="monotone"
                                                dataKey="assessments"
                                                stroke={theme.palette.warning.main}
                                                name="Assessments"
                                            />
                                        </ComposedChart>
                                    </ResponsiveContainer>
                                </Box>
                            </CardContent>
                        </Card>
                    </Grid>
            </Grid>
            )}
        </Box>
    );
};

export default Analytics; 