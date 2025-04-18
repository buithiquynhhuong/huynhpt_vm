import React from 'react';
import { Box } from '@mui/material';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';

const Layout = () => {
    return (
        <Box sx={{ display: 'flex' }}>
            <Sidebar />
            <Box 
                component="main" 
                sx={{ 
                    flexGrow: 1, 
                    p: 3,
                    pt: 8,
                    mt: 2,
                    minHeight: '100vh',
                    backgroundColor: '#f5f5f5'
                }}
            >
                <Outlet />
            </Box>
        </Box>
    );
};

export default Layout; 