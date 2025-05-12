import React from 'react';
import { AppBar, Toolbar, Typography, Button, Box } from '@mui/material';
import { Link as RouterLink } from 'react-router-dom';
import SchoolIcon from '@mui/icons-material/School';

function Navbar() {
    return (
        <AppBar position="static">
            <Toolbar>
                <SchoolIcon sx={{ mr: 2 }} />
                <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
                    Shuleni
                </Typography>
                <Box>
                    <Button color="inherit" component={RouterLink} to="/dashboard">
                        Dashboard
                    </Button>
                    <Button color="inherit" component={RouterLink} to="/schools">
                        Schools
                    </Button>
                    <Button color="inherit" component={RouterLink} to="/classes">
                        Classes
                    </Button>
                    <Button color="inherit" component={RouterLink} to="/resources">
                        Resources
                    </Button>
                    <Button color="inherit" component={RouterLink} to="/attendance">
                        Attendance
                    </Button>
                    <Button color="inherit" component={RouterLink} to="/exams">
                        Exams
                    </Button>
                    <Button color="inherit" component={RouterLink} to="/chat">
                        Chat
                    </Button>
                </Box>
            </Toolbar>
        </AppBar>
    );
}

export default Navbar; 