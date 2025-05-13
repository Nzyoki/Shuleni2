import React, { useState } from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import {
    AppBar,
    Box,
    CssBaseline,
    Drawer,
    IconButton,
    List,
    ListItem,
    ListItemIcon,
    ListItemText,
    Toolbar,
    Typography,
    Button,
    Divider,
    useTheme,
    Paper,
    Grid,
} from '@mui/material';
import {
    Menu as MenuIcon,
    Dashboard as DashboardIcon,
    School as SchoolIcon,
    Class as ClassIcon,
    People as PeopleIcon,
    Assignment as AssignmentIcon,
    Book as BookIcon,
    EventNote as EventNoteIcon,
    Logout as LogoutIcon,
    Email as EmailIcon,
    Phone as PhoneIcon,
    LocationOn as LocationIcon,
    Facebook as FacebookIcon,
    Twitter as TwitterIcon,
    LinkedIn as LinkedInIcon,
    Copyright as CopyrightIcon,
} from '@mui/icons-material';
import { useAuth } from '../../contexts/AuthContext';

const drawerWidth = 240;

const roleMenuMap = {
    super_admin: [
        { text: 'Dashboard', icon: <DashboardIcon />, path: '/dashboard' },
        { text: 'Schools', icon: <SchoolIcon />, path: '/schools' },
        { text: 'Manage Users', icon: <PeopleIcon />, path: '/users' },
        { text: 'Analytics', icon: <DashboardIcon />, path: '/analytics' },
    ],
    school_admin: [
        { text: 'Dashboard', icon: <DashboardIcon />, path: '/dashboard' },
        { text: 'Students', icon: <PeopleIcon />, path: '/students' },
        { text: 'Classes', icon: <ClassIcon />, path: '/classes' },
        { text: 'Resources', icon: <BookIcon />, path: '/resources' },
        { text: 'Assessments', icon: <AssignmentIcon />, path: '/assessments' },
        { text: 'Attendance', icon: <EventNoteIcon />, path: '/attendance' },
        { text: 'Manage Users', icon: <PeopleIcon />, path: '/users' },
        { text: 'Analytics', icon: <DashboardIcon />, path: '/analytics' },
    ],
    teacher: [
        { text: 'Dashboard', icon: <DashboardIcon />, path: '/dashboard' },
        { text: 'Classes', icon: <ClassIcon />, path: '/classes' },
        { text: 'Assessments', icon: <AssignmentIcon />, path: '/assessments' },
        { text: 'Resources', icon: <BookIcon />, path: '/resources' },
        { text: 'Chat', icon: <EventNoteIcon />, path: '/chat' },
    ],
    student: [
        { text: 'Dashboard', icon: <DashboardIcon />, path: '/dashboard' },
        { text: 'Classes', icon: <ClassIcon />, path: '/classes' },
        { text: 'Resources', icon: <BookIcon />, path: '/resources' },
        { text: 'Assessments', icon: <AssignmentIcon />, path: '/assessments' },
        { text: 'Chat', icon: <EventNoteIcon />, path: '/chat' },
    ],
};

const Layout = () => {
    const [mobileOpen, setMobileOpen] = useState(false);
    const { logout, user } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();
    const theme = useTheme();

    const handleDrawerToggle = () => {
        setMobileOpen(!mobileOpen);
    };

    const handleNavigation = (path) => {
        navigate(path);
        setMobileOpen(false);
    };

    const menuToShow = user && user.role ? roleMenuMap[user.role] || [] : [];

    const drawer = (
        <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
            <Toolbar sx={{
                p: 2,
                backgroundColor: 'primary.light',
                borderBottom: '1px solid',
                borderColor: 'primary.main'
            }}>
                <Typography variant="h5" noWrap component="div" sx={{
                    fontWeight: 600,
                    color: 'text.primary',
                    letterSpacing: '0.5px'
                }}>
                    Shuleni
                </Typography>
            </Toolbar>
            <Box sx={{ flexGrow: 1, p: 2, overflowY: 'auto' }}>
                <List>
                    {menuToShow.map((item) => (
                        <ListItem
                            button
                            key={item.text}
                            onClick={() => handleNavigation(item.path)}
                            selected={location.pathname === item.path}
                            sx={{
                                borderRadius: '8px',
                                mb: 1,
                                '&.Mui-selected': {
                                    backgroundColor: 'primary.light',
                                    '&:hover': {
                                        backgroundColor: 'primary.light',
                                    },
                                },
                                '&:hover': {
                                    backgroundColor: 'rgba(255, 203, 164, 0.1)',
                                },
                            }}
                        >
                            <ListItemIcon sx={{
                                color: location.pathname === item.path ? 'primary.dark' : 'text.secondary',
                                minWidth: '40px'
                            }}>
                                {item.icon}
                            </ListItemIcon>
                            <ListItemText
                                primary={item.text}
                                sx={{
                                    '& .MuiListItemText-primary': {
                                        fontWeight: location.pathname === item.path ? 600 : 400,
                                        color: location.pathname === item.path ? 'primary.dark' : 'text.primary',
                                    },
                                }}
                            />
                        </ListItem>
                    ))}
                </List>
            </Box>
            <Divider sx={{ mx: 2 }} />
            <Box sx={{ p: 2 }}>
                <ListItem
                    button
                    onClick={logout}
                    sx={{
                        borderRadius: '8px',
                        '&:hover': {
                            backgroundColor: 'rgba(255, 203, 164, 0.1)',
                        },
                    }}
                >
                    <ListItemIcon sx={{ color: 'text.secondary', minWidth: '40px' }}>
                        <LogoutIcon />
                    </ListItemIcon>
                    <ListItemText primary="Logout" />
                </ListItem>
            </Box>
        </Box>
    );

    return (
        <Box sx={{ display: 'flex', minHeight: '100vh', flexDirection: 'column' }}>
            <CssBaseline />
            <AppBar
                position="fixed"
                sx={{
                    width: { sm: `calc(100% - ${drawerWidth}px)` },
                    ml: { sm: `${drawerWidth}px` },
                }}
            >
                <Toolbar sx={{ justifyContent: 'space-between' }}>
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <IconButton
                            color="inherit"
                            aria-label="open drawer"
                            edge="start"
                            onClick={handleDrawerToggle}
                            sx={{ mr: 2, display: { sm: 'none' } }}
                        >
                            <MenuIcon />
                        </IconButton>
                        <Typography variant="h6" noWrap component="div">
                            {menuToShow.find(item => item.path === location.pathname)?.text || 'Dashboard'}
                        </Typography>
                    </Box>
                    <Box sx={{
                        display: 'flex',
                        alignItems: 'center',
                        backgroundColor: 'rgba(255, 255, 255, 0.1)',
                        borderRadius: '20px',
                        px: 2,
                        py: 0.5
                    }}>
                        <Typography variant="body1">
                            {user?.first_name} {user?.last_name}
                        </Typography>
                    </Box>
                </Toolbar>
            </AppBar>
            <Box
                component="nav"
                sx={{ width: { sm: drawerWidth }, flexShrink: { sm: 0 } }}
            >
                <Drawer
                    variant="temporary"
                    open={mobileOpen}
                    onClose={handleDrawerToggle}
                    ModalProps={{
                        keepMounted: true,
                    }}
                    sx={{
                        display: { xs: 'block', sm: 'none' },
                        '& .MuiDrawer-paper': { boxSizing: 'border-box', width: drawerWidth },
                    }}
                >
                    {drawer}
                </Drawer>
                <Drawer
                    variant="permanent"
                    sx={{
                        display: { xs: 'none', sm: 'block' },
                        '& .MuiDrawer-paper': { boxSizing: 'border-box', width: drawerWidth },
                    }}
                    open
                >
                    {drawer}
                </Drawer>
            </Box>
            <Box
                component="main"
                sx={{
                    flexGrow: 1,
                    p: 3,
                    width: { sm: `calc(100% - ${drawerWidth}px)` },
                    ml: { sm: `${drawerWidth}px` },
                    mt: '64px',
                    display: 'flex',
                    flexDirection: 'column',
                    minHeight: 'calc(100vh - 64px)',
                    backgroundColor: 'background.default',
                }}
            >
                <Box sx={{ flex: 1 }}>
                    <Outlet />
                </Box>
                <Paper
                    component="footer"
                    elevation={3}
                    sx={{
                        mt: 'auto',
                        py: 4,
                        px: 3,
                        backgroundColor: 'primary.main',
                        borderTop: '2px solid',
                        borderColor: 'secondary.main',
                    }}
                >
                    <Box sx={{ 
                        maxWidth: 'lg',
                        mx: 'auto',
                        width: '100%'
                    }}>
                        <Grid container spacing={3}>
                            <Grid item xs={12} sm={4}>
                                <Box>
                                    <Typography variant="h6" color="secondary.dark" gutterBottom fontWeight="600">
                                        Binary Brains
                                    </Typography>
                                    <Typography variant="body2" color="text.primary" sx={{ opacity: 0.9 }}>
                                        Empowering education through innovative technology solutions.
                                    </Typography>
                                </Box>
                            </Grid>
                            <Grid item xs={12} sm={4}>
                                <Box>
                                    <Typography variant="h6" color="secondary.dark" gutterBottom fontWeight="600">
                                        Contact Us
                                    </Typography>
                                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                                        <EmailIcon sx={{ fontSize: 20, mr: 1, color: 'secondary.dark' }} />
                                        <Typography variant="body2" color="text.primary" sx={{ opacity: 0.9 }}>
                                            info@binarybrains.com
                                        </Typography>
                                    </Box>
                                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                                        <PhoneIcon sx={{ fontSize: 20, mr: 1, color: 'secondary.dark' }} />
                                        <Typography variant="body2" color="text.primary" sx={{ opacity: 0.9 }}>
                                            +254 712 345 678
                                        </Typography>
                                    </Box>
                                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                        <LocationIcon sx={{ fontSize: 20, mr: 1, color: 'secondary.dark' }} />
                                        <Typography variant="body2" color="text.primary" sx={{ opacity: 0.9 }}>
                                            Nairobi, Kenya
                                        </Typography>
                                    </Box>
                                </Box>
                            </Grid>
                            <Grid item xs={12} sm={4}>
                                <Box>
                                    <Typography variant="h6" color="secondary.dark" gutterBottom fontWeight="600">
                                        Follow Us
                                    </Typography>
                                    <Box sx={{ display: 'flex', gap: 2 }}>
                                        <IconButton
                                            size="small"
                                            sx={{
                                                color: 'secondary.dark',
                                                '&:hover': { 
                                                    color: 'secondary.main',
                                                    backgroundColor: 'rgba(210, 180, 140, 0.1)'
                                                }
                                            }}
                                        >
                                            <FacebookIcon />
                                        </IconButton>
                                        <IconButton
                                            size="small"
                                            sx={{
                                                color: 'secondary.dark',
                                                '&:hover': { 
                                                    color: 'secondary.main',
                                                    backgroundColor: 'rgba(210, 180, 140, 0.1)'
                                                }
                                            }}
                                        >
                                            <TwitterIcon />
                                        </IconButton>
                                        <IconButton
                                            size="small"
                                            sx={{
                                                color: 'secondary.dark',
                                                '&:hover': { 
                                                    color: 'secondary.main',
                                                    backgroundColor: 'rgba(210, 180, 140, 0.1)'
                                                }
                                            }}
                                        >
                                            <LinkedInIcon />
                                        </IconButton>
                                    </Box>
                                </Box>
                            </Grid>
                        </Grid>
                        <Box sx={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            mt: 3,
                            pt: 3,
                            borderTop: '1px solid',
                            borderColor: 'secondary.main',
                        }}>
                            <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                <CopyrightIcon sx={{ fontSize: 16, mr: 0.5, color: 'text.primary', opacity: 0.9 }} />
                                <Typography variant="body2" color="text.primary" sx={{ opacity: 0.9 }}>
                                    {new Date().getFullYear()} Binary Brains. All rights reserved.
                                </Typography>
                            </Box>
                            <Typography variant="body2" color="text.primary" sx={{ opacity: 0.9 }}>
                                Shuleni v1.0.0
                            </Typography>
                        </Box>
                    </Box>
                </Paper>
            </Box>
        </Box>
    );
};

export default Layout; 