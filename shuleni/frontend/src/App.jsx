import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider, createTheme } from '@mui/material';
import { AuthProvider } from './contexts/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import Layout from './components/layout/Layout';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import SchoolManagement from './pages/SchoolManagement';
import UserManagement from './pages/UserManagement';
import ClassManagement from './pages/ClassManagement';
import StudentManagement from './pages/StudentManagement';
import AssessmentManagement from './pages/AssessmentManagement';
import AttendanceManagement from './pages/AttendanceManagement';
import ResourceManagement from './pages/ResourceManagement';
import Reports from './pages/Reports';
import Chat from './pages/Chat';
import './App.css';

console.log('App component imported');

const theme = createTheme({
    palette: {
        primary: {
            main: '#FFCBA4',
            light: '#FFE5D4',
            dark: '#FF9A6D',
            contrastText: '#2D3748',
        },
        secondary: {
            main: '#D2B48C',
            light: '#E8D5B5',
            dark: '#B89B6D',
            contrastText: '#2D3748',
        },
        background: {
            default: '#FFF8F3',
            paper: '#FFFFFF',
        },
        text: {
            primary: '#2D3748',
            secondary: '#4A5568',
        },
    },
    typography: {
        fontFamily: '"Poppins", "Roboto", "Helvetica", "Arial", sans-serif',
        h1: {
            fontWeight: 600,
            fontSize: '2.5rem',
        },
        h2: {
            fontWeight: 600,
            fontSize: '2rem',
        },
        h3: {
            fontWeight: 600,
            fontSize: '1.75rem',
        },
        h4: {
            fontWeight: 600,
            fontSize: '1.5rem',
        },
        h5: {
            fontWeight: 600,
            fontSize: '1.25rem',
        },
        h6: {
            fontWeight: 600,
            fontSize: '1rem',
        },
        button: {
            textTransform: 'none',
            fontWeight: 500,
        },
    },
    components: {
        MuiAppBar: {
            styleOverrides: {
                root: {
                    backgroundColor: '#FFCBA4',
                    boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
                },
            },
        },
        MuiDrawer: {
            styleOverrides: {
                paper: {
                    backgroundColor: '#FFF8F3',
                    borderRight: '1px solid rgba(0,0,0,0.08)',
                },
            },
        },
        MuiButton: {
            styleOverrides: {
                root: {
                    borderRadius: '8px',
                    padding: '8px 16px',
                    boxShadow: 'none',
                    '&:hover': {
                        boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
                    },
                },
                contained: {
                    '&:hover': {
                        boxShadow: '0 4px 8px rgba(0,0,0,0.1)',
                    },
                },
            },
        },
        MuiCard: {
            styleOverrides: {
                root: {
                    borderRadius: '12px',
                    boxShadow: '0 2px 4px rgba(0,0,0,0.05)',
                    '&:hover': {
                        boxShadow: '0 4px 8px rgba(0,0,0,0.1)',
                    },
                },
            },
        },
        MuiPaper: {
            styleOverrides: {
                root: {
                    borderRadius: '12px',
                },
                elevation1: {
                    boxShadow: '0 2px 4px rgba(0,0,0,0.05)',
                },
                elevation2: {
                    boxShadow: '0 4px 8px rgba(0,0,0,0.1)',
                },
            },
        },
    },
});

function App() {
    console.log('App component rendering');

    return (
        <ThemeProvider theme={theme}>
            <Router>
                <AuthProvider>
                    <Routes>
                        <Route path="/login" element={<Login />} />
                        <Route path="/register" element={<Register />} />
                        <Route path="/" element={
                            <ProtectedRoute>
                                <Layout />
                            </ProtectedRoute>
                        }>
                            <Route index element={<Navigate to="/dashboard" replace />} />
                            <Route path="dashboard" element={<Dashboard />} />
                            <Route path="schools" element={
                                <ProtectedRoute requiredPermissions={["manage_schools"]}>
                                    <SchoolManagement />
                                </ProtectedRoute>
                            } />
                            <Route path="users" element={
                                <ProtectedRoute requiredPermissions={["manage_users", "manage_all_users"]}>
                                    <UserManagement />
                                </ProtectedRoute>
                            } />
                            <Route path="analytics" element={
                                <ProtectedRoute requiredPermissions={["view_analytics", "view_school_reports", "view_school_analytics"]}>
                                    <Reports />
                                </ProtectedRoute>
                            } />
                            <Route path="students" element={
                                <ProtectedRoute requiredPermissions={["manage_students", "manage_school_students"]}>
                                    <StudentManagement />
                                </ProtectedRoute>
                            } />
                            <Route path="classes" element={
                                <ProtectedRoute requiredPermissions={["manage_classes", "manage_school_classes", "manage_class_students", "view_class_students", "view_classes"]}>
                                    <ClassManagement />
                                </ProtectedRoute>
                            } />
                            <Route path="resources" element={
                                <ProtectedRoute requiredPermissions={["manage_resources", "view_resources", "create_resources", "edit_resources"]}>
                                    <ResourceManagement />
                                </ProtectedRoute>
                            } />
                            <Route path="assessments" element={
                                <ProtectedRoute requiredPermissions={["manage_assessments", "view_assessments", "create_assessments", "edit_assessments", "manage_class_assessments", "view_own_assessments", "submit_assessments", "take_assessments"]}>
                                    <AssessmentManagement />
                                </ProtectedRoute>
                            } />
                            <Route path="attendance" element={
                                <ProtectedRoute requiredPermissions={["manage_attendance", "view_attendance", "take_attendance"]}>
                                    <AttendanceManagement />
                                </ProtectedRoute>
                            } />
                            <Route path="chat" element={
                                <ProtectedRoute requiredPermissions={["participate_chat", "monitor_chat"]}>
                                    <Chat />
                                </ProtectedRoute>
                            } />
                            <Route path="reports" element={
                                <ProtectedRoute requiredPermissions={['view_reports', 'view_school_reports', 'view_class_reports']}>
                                    <Reports />
                                </ProtectedRoute>
                            } />
                            <Route path="*" element={<Navigate to="/dashboard" replace />} />
                        </Route>
                    </Routes>
                </AuthProvider>
            </Router>
        </ThemeProvider>
    );
}

export default App; 