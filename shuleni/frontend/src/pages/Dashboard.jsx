import React, { useState, useEffect } from 'react';
import {
    Grid,
    Paper,
    Typography,
    Box,
    Card,
    CardContent,
    CardHeader,
    List,
    ListItem,
    ListItemText,
    ListItemIcon,
    Divider,
} from '@mui/material';
import {
    School as SchoolIcon,
    Class as ClassIcon,
    People as PeopleIcon,
    Assignment as AssignmentIcon,
    Event as EventIcon,
} from '@mui/icons-material';
import { getSchools } from '../services/schools';

const StatCard = ({ title, value, icon }) => (
    <Card>
        <CardContent>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                {icon}
                <Typography variant="h6" component="div" sx={{ ml: 1 }}>
                    {title}
                </Typography>
            </Box>
            <Typography variant="h4" component="div">
                {value}
            </Typography>
        </CardContent>
    </Card>
);

const Dashboard = () => {
    const [stats, setStats] = useState({
        schools: 0,
        classes: 0,
        students: 0,
        assessments: 0,
    });
    const [recentActivity, setRecentActivity] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const schoolsData = await getSchools();
                setStats(prev => ({
                    ...prev,
                    schools: schoolsData.schools?.length || 0
                }));
                // TODO: Fetch other stats when their APIs are ready
            } catch (error) {
                console.error('Error fetching dashboard data:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, []);

    if (loading) {
        return (
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
                <Typography>Loading...</Typography>
            </Box>
        );
    }

    return (
        <Box>
            <Typography variant="h4" component="h1" gutterBottom>
                Dashboard
            </Typography>
            <Grid container spacing={3}>
                <Grid item xs={12} sm={6} md={3}>
                    <StatCard
                        title="Schools"
                        value={stats.schools}
                        icon={<SchoolIcon color="primary" />}
                    />
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                    <StatCard
                        title="Classes"
                        value={stats.classes}
                        icon={<ClassIcon color="primary" />}
                    />
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                    <StatCard
                        title="Students"
                        value={stats.students}
                        icon={<PeopleIcon color="primary" />}
                    />
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                    <StatCard
                        title="Assessments"
                        value={stats.assessments}
                        icon={<AssignmentIcon color="primary" />}
                    />
                </Grid>
                <Grid item xs={12} md={6}>
                    <Paper sx={{ p: 2 }}>
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
                    <Paper sx={{ p: 2 }}>
                        <Typography variant="h6" gutterBottom>
                            Quick Actions
                        </Typography>
                        <List>
                            <ListItem button>
                                <ListItemIcon>
                                    <SchoolIcon />
                                </ListItemIcon>
                                <ListItemText primary="Add New School" />
                            </ListItem>
                            <Divider />
                            <ListItem button>
                                <ListItemIcon>
                                    <ClassIcon />
                                </ListItemIcon>
                                <ListItemText primary="Create New Class" />
                            </ListItem>
                            <Divider />
                            <ListItem button>
                                <ListItemIcon>
                                    <AssignmentIcon />
                                </ListItemIcon>
                                <ListItemText primary="Create Assessment" />
                            </ListItem>
                        </List>
                    </Paper>
                </Grid>
            </Grid>
        </Box>
    );
};

export default Dashboard; 