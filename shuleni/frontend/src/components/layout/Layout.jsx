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
    Chat as ChatIcon,
} from '@mui/icons-material';
import { useAuth } from '../../contexts/AuthContext';
import Footer from './Footer';

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
        { text: 'Chat', icon: <ChatIcon />, path: '/chat' },
        { text: 'Analytics', icon: <DashboardIcon />, path: '/analytics' },
    ],
    teacher: [
        { text: 'Dashboard', icon: <DashboardIcon />, path: '/dashboard' },
        { text: 'Classes', icon: <ClassIcon />, path: '/classes' },
        { text: 'Assessments', icon: <AssignmentIcon />, path: '/assessments' },
        { text: 'Resources', icon: <BookIcon />, path: '/resources' },
        { text: 'Chat', icon: <ChatIcon />, path: '/chat' },
    ],
    student: [
        { text: 'Dashboard', icon: <DashboardIcon />, path: '/dashboard' },
        { text: 'Classes', icon: <ClassIcon />, path: '/classes' },
        { text: 'Resources', icon: <BookIcon />, path: '/resources' },
        { text: 'Assessments', icon: <AssignmentIcon />, path: '/assessments' },
        { text: 'Chat', icon: <ChatIcon />, path: '/chat' },
    ],
};

const Layout = () => {
    const [mobileOpen, setMobileOpen] = useState(false);
    const { logout, user } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();

    const handleDrawerToggle = () => {
        setMobileOpen(!mobileOpen);
    };

    const handleNavigation = (path) => {
        navigate(path);
        setMobileOpen(false);
    };

    const menuToShow = user && user.role ? roleMenuMap[user.role] || [] : [];

    const drawer = (
        <Box sx={{ bgcolor: '#FFDAB9', height: '100%' }}>
            <Toolbar sx={{ bgcolor: '#D2B48C' }}>
                <Typography variant="h6" component="div" sx={{ color: '#8B4513', fontWeight: 'bold' }}>
                    Shuleni
                </Typography>
            </Toolbar>
            <Divider sx={{ bgcolor: '#D2B48C' }} />
            <List>
                {menuToShow.map((item) => (
                    <ListItem
                        button
                        key={item.text}
                        onClick={() => handleNavigation(item.path)}
                        sx={{
                            color: '#8B4513',
                            '&:hover': {
                                bgcolor: 'var(--color-light-teal)',
                                color: 'var(--color-teal)',
                                '& .MuiListItemIcon-root': {
                                    color: 'var(--color-teal)',
                                },
                            },
                            ...(location.pathname === item.path && {
                                bgcolor: 'var(--color-light-teal)',
                                color: 'var(--color-teal)',
                                '& .MuiListItemIcon-root': {
                                    color: 'var(--color-teal)',
                                },
                            }),
                        }}
                    >
                        <ListItemIcon sx={{ color: '#8B4513' }}>
                            {item.icon}
                        </ListItemIcon>
                        <ListItemText primary={item.text} />
                    </ListItem>
                ))}
                <Divider sx={{ my: 2, bgcolor: '#D2B48C' }} />
                <ListItem
                    button
                    onClick={logout}
                    sx={{
                        color: '#8B4513',
                        '&:hover': {
                            bgcolor: 'var(--color-light-teal)',
                            color: 'var(--color-teal)',
                            '& .MuiListItemIcon-root': {
                                color: 'var(--color-teal)',
                            },
                        },
                    }}
                >
                    <ListItemIcon sx={{ color: '#8B4513' }}>
                        <LogoutIcon />
                    </ListItemIcon>
                    <ListItemText primary="Logout" />
                </ListItem>
            </List>
        </Box>
    );

    return (
        <Box sx={{ display: 'flex', minHeight: '100vh', bgcolor: '#FFF5EE' }}>
            <CssBaseline />
            <AppBar
                position="fixed"
                sx={{
                    width: { sm: `calc(100% - ${drawerWidth}px)` },
                    ml: { sm: `${drawerWidth}px` },
                    bgcolor: '#FFDAB9',
                    boxShadow: 'none',
                    borderBottom: '1px solid #D2B48C',
                }}
            >
                <Toolbar>
                    <IconButton
                        color="inherit"
                        aria-label="open drawer"
                        edge="start"
                        onClick={handleDrawerToggle}
                        sx={{
                            mr: 2,
                            display: { sm: 'none' },
                            color: '#8B4513',
                            '&:hover': {
                                color: 'var(--color-teal)',
                            },
                        }}
                    >
                        <MenuIcon />
                    </IconButton>
                    <Typography variant="h6" noWrap component="div" sx={{ color: '#8B4513' }}>
                        {user?.first_name} {user?.last_name} - {user?.role?.replace('_', ' ')}
                    </Typography>
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
                        '& .MuiDrawer-paper': {
                            boxSizing: 'border-box',
                            width: drawerWidth,
                            bgcolor: '#FFDAB9',
                        },
                    }}
                >
                    {drawer}
                </Drawer>
                <Drawer
                    variant="permanent"
                    sx={{
                        display: { xs: 'none', sm: 'block' },
                        '& .MuiDrawer-paper': {
                            boxSizing: 'border-box',
                            width: drawerWidth,
                            bgcolor: '#FFDAB9',
                            borderRight: '1px solid #D2B48C',
                        },
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
                    display: 'flex',
                    flexDirection: 'column',
                    minHeight: '100vh',
                }}
            >
                <Toolbar />
                <Box sx={{ flex: 1 }}>
                    <Outlet />
                </Box>
                <Footer />
            </Box>
        </Box>
    );
};

export default Layout; 