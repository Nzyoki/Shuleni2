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
            main: '#1976d2',
        },
        secondary: {
            main: '#dc004e',
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