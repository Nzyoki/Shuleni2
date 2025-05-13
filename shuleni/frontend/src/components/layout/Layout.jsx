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

    const handleDrawerToggle = () => {
        setMobileOpen(!mobileOpen);
    };

    const handleNavigation = (path) => {
        navigate(path);
        setMobileOpen(false);
    };

    const menuToShow = user && user.role ? roleMenuMap[user.role] || [] : [];

    const drawer = (
        <div>
            <Toolbar sx={{ backgroundColor: '#FFDAB9' }}>
                <Typography variant="h6" noWrap component="div" color="#8B4513">
                    Shuleni
                </Typography>
            </Toolbar>
            <Divider sx={{ backgroundColor: '#D2B48C' }} />
            <List sx={{ backgroundColor: '#FFF5EE' }}>
                {menuToShow.map((item) => (
                    <ListItem
                        button
                        key={item.text}
                        onClick={() => handleNavigation(item.path)}
                        selected={location.pathname === item.path}
                        sx={{
                            '&.Mui-selected': {
                                backgroundColor: '#FFDAB9',
                                '&:hover': {
                                    backgroundColor: '#FFE4C4',
                                },
                            },
                            '&:hover': {
                                backgroundColor: '#FFE4C4',
                            },
                        }}
                    >
                        <ListItemIcon sx={{ color: '#8B4513' }}>{item.icon}</ListItemIcon>
                        <ListItemText
                            primary={item.text}
                            sx={{
                                color: '#8B4513',
                                '& .MuiTypography-root': {
                                    fontWeight: location.pathname === item.path ? 600 : 400,
                                }
                            }}
                        />
                    </ListItem>
                ))}
            </List>
            <Divider sx={{ backgroundColor: '#D2B48C' }} />
            <List sx={{ backgroundColor: '#FFF5EE' }}>
                <ListItem
                    button
                    onClick={logout}
                    sx={{
                        '&:hover': {
                            backgroundColor: '#FFE4C4',
                        },
                    }}
                >
                    <ListItemIcon sx={{ color: '#8B4513' }}>
                        <LogoutIcon />
                    </ListItemIcon>
                    <ListItemText primary="Logout" sx={{ color: '#8B4513' }} />
                </ListItem>
            </List>
        </div>
    );

    return (
        <Box sx={{ display: 'flex' }}>
            <CssBaseline />
            <AppBar
                position="fixed"
                sx={{
                    width: { sm: `calc(100% - ${drawerWidth}px)` },
                    ml: { sm: `${drawerWidth}px` },
                    backgroundColor: '#FFDAB9',
                    boxShadow: 'none',
                    borderBottom: '2px solid #D2B48C',
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
                        }}
                    >
                        <MenuIcon />
                    </IconButton>
                    <Typography
                        variant="h6"
                        noWrap
                        component="div"
                        sx={{
                            flexGrow: 1,
                            color: '#8B4513',
                        }}
                    >
                        {menuToShow.find(item => item.path === location.pathname)?.text || 'Dashboard'}
                    </Typography>
                    <Typography
                        variant="body1"
                        sx={{
                            mr: 2,
                            color: '#8B4513',
                        }}
                    >
                        {user?.first_name} {user?.last_name}
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
                            backgroundColor: '#FFF5EE',
                            borderRight: '2px solid #D2B48C',
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
                            backgroundColor: '#FFF5EE',
                            borderRight: '2px solid #D2B48C',
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
                    mt: '64px',
                    mb: '80px',
                    backgroundColor: '#FFF5EE',
                    minHeight: '100vh',
                }}
            >
                <Outlet />
            </Box>
            <Footer />
        </Box>
    );
};

export default Layout; 