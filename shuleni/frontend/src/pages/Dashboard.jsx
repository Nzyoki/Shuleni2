import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import {
    Grid,
    Paper,
    Typography,
    Box,
    Card,
    CardContent,
    List,
    ListItem,
    ListItemText,
    ListItemIcon,
    Divider,
    CircularProgress,
} from '@mui/material';
import {
    School as SchoolIcon,
    Class as ClassIcon,
    People as PeopleIcon,
    Assignment as AssignmentIcon,
    Event as EventIcon,
} from '@mui/icons-material';
import { getSchools } from '../services/schools';
import { getClasses } from '../services/classes';
import { getStudents } from '../services/students';
import { getAssessments } from '../services/assessments';

const StatCard = ({ title, value, icon, isLoading }) => (
    <Card sx={{ height: '100%' }}>
        <CardContent>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                {icon}
                <Typography variant="h6" component="div" sx={{ ml: 1 }}>
                    {title}
                </Typography>
            </Box>
            {isLoading ? (
                <Box display="flex" justifyContent="center">
                    <CircularProgress size={24} />
                </Box>
            ) : (
                <Typography variant="h4" component="div">
                    {value}
                </Typography>
            )}
        </CardContent>
    </Card>
);

const Dashboard = () => {
    const navigate = useNavigate();
    const [stats, setStats] = useState({
        schools: 0,
        classes: 0,
        students: 0,
        assessments: 0,
    });
    const [loading, setLoading] = useState({
        schools: true,
        classes: true,
        students: true,
        assessments: true,
    });

    // Create example activity data
    const recentActivity = [
        { title: "New student added to Math Class", timestamp: "Today 11:30 AM" },
        { title: "Assessment 'Midterm Exam' created", timestamp: "Yesterday 4:15 PM" },
        { title: "New class 'Physics 101' created", timestamp: "Yesterday 2:30 PM" },
        { title: "System update completed", timestamp: "May 10, 2025" }
    ];

    useEffect(() => {
        const fetchStats = async () => {
            // Fetch schools data
            try {
                const schoolsData = await getSchools();
                setStats(prev => ({
                    ...prev,
                    schools: schoolsData.length || 0
                }));
            } catch (error) {
                console.error('Error fetching schools:', error);
            } finally {
                setLoading(prev => ({ ...prev, schools: false }));
            }

            // Fetch classes data
            try {
                const classesData = await getClasses();
                setStats(prev => ({
                    ...prev,
                    classes: classesData.length || 0
                }));
            } catch (error) {
                console.error('Error fetching classes:', error);
            } finally {
                setLoading(prev => ({ ...prev, classes: false }));
            }

            // Fetch students data
            try {
                const studentsData = await getStudents();
                setStats(prev => ({
                    ...prev,
                    students: studentsData.length || 0
                }));
            } catch (error) {
                console.error('Error fetching students:', error);
            } finally {
                setLoading(prev => ({ ...prev, students: false }));
            }

            // Fetch assessments data
            try {
                const assessmentsData = await getAssessments();
                setStats(prev => ({
                    ...prev,
                    assessments: assessmentsData.length || 0
                }));
            } catch (error) {
                console.error('Error fetching assessments:', error);
            } finally {
                setLoading(prev => ({ ...prev, assessments: false }));
            }
        };

        fetchStats();
    }, []);

    const handleNavigate = (path) => {
        navigate(path);
    };

    return (
        <Box sx={{ p: 3 }}>
            <Typography variant="h4" component="h1" gutterBottom>
                Dashboard
            </Typography>
            <Grid container spacing={3}>
                <Grid item xs={12} sm={6} md={3}>
                    <StatCard
                        title="Schools"
                        value={stats.schools}
                        icon={<SchoolIcon color="primary" />}
                        isLoading={loading.schools}
                    />
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                    <StatCard
                        title="Classes"
                        value={stats.classes}
                        icon={<ClassIcon color="primary" />}
                        isLoading={loading.classes}
                    />
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                    <StatCard
                        title="Students"
                        value={stats.students}
                        icon={<PeopleIcon color="primary" />}
                        isLoading={loading.students}
                    />
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                    <StatCard
                        title="Assessments"
                        value={stats.assessments}
                        icon={<AssignmentIcon color="primary" />}
                        isLoading={loading.assessments}
                    />
                </Grid>
                <Grid item xs={12} md={6}>
                    <Paper sx={{ p: 2, height: '100%' }}>
                        <Typography variant="h6" gutterBottom>
                            Recent Activity
                        </Typography>
                        <List>
                            {recentActivity.length === 0 ? (
                                <ListItem>
                                    <ListItemText primary="No recent activity" />
                                </ListItem>
                            ) : (
                                recentActivity.map((activity, index) => (
                                    <React.Fragment key={index}>
                                        <ListItem>
                                            <ListItemIcon>
                                                <EventIcon />
                                            </ListItemIcon>
                                            <ListItemText
                                                primary={activity.title}
                                                secondary={activity.timestamp}
                                            />
                                        </ListItem>
                                        {index < recentActivity.length - 1 && <Divider />}
                                    </React.Fragment>
                                ))
                            )}
                        </List>
                    </Paper>
                </Grid>
                <Grid item xs={12} md={6}>
                    <Paper sx={{ p: 2, height: '100%' }}>
                        <Typography variant="h6" gutterBottom>
                            Quick Actions
                        </Typography>
                        <List>
                            <ListItem
                                button
                                onClick={() => handleNavigate('/schools')}
                                sx={{ '&:hover': { backgroundColor: 'rgba(0, 0, 0, 0.04)' } }}
                            >
                                <ListItemIcon>
                                    <SchoolIcon />
                                </ListItemIcon>
                                <ListItemText primary="Manage Schools" />
                            </ListItem>
                            <Divider />
                            <ListItem
                                button
                                onClick={() => handleNavigate('/classes')}
                                sx={{ '&:hover': { backgroundColor: 'rgba(0, 0, 0, 0.04)' } }}
                            >
                                <ListItemIcon>
                                    <ClassIcon />
                                </ListItemIcon>
                                <ListItemText primary="Manage Classes" />
                            </ListItem>
                            <Divider />
                            <ListItem
                                button
                                onClick={() => handleNavigate('/users')}
                                sx={{ '&:hover': { backgroundColor: 'rgba(0, 0, 0, 0.04)' } }}
                            >
                                <ListItemIcon>
                                    <PeopleIcon />
                                </ListItemIcon>
                                <ListItemText primary="Manage Users" />
                            </ListItem>
                            <Divider />
                            <ListItem
                                button
                                onClick={() => handleNavigate('/assessments')}
                                sx={{ '&:hover': { backgroundColor: 'rgba(0, 0, 0, 0.04)' } }}
                            >
                                <ListItemIcon>
                                    <AssignmentIcon />
                                </ListItemIcon>
                                <ListItemText primary="Manage Assessments" />
                            </ListItem>
                        </List>
                    </Paper>
                </Grid>
            </Grid>
        </Box>
    );
};

export default Dashboard; 