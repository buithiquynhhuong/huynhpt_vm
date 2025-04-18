import React from 'react';
import {
    Box,
    Drawer,
    List,
    ListItem,
    ListItemIcon,
    ListItemText,
    ListItemButton,
    Typography,
    Divider
} from '@mui/material';
import {
    Dashboard as DashboardIcon,
    Inventory as InventoryIcon,
    People as PeopleIcon,
    Settings as SettingsIcon,
    LocalShipping as LocalShippingIcon,
    CompareArrows as CompareArrowsIcon,
    Category as CategoryIcon,
    Business as BusinessIcon,
    AccountTree as AccountTreeIcon,
    Domain as DomainIcon,
    Groups as GroupsIcon,
    Apartment as ApartmentIcon,
    CorporateFare as CorporateFareIcon
} from '@mui/icons-material';
import { useNavigate, useLocation } from 'react-router-dom';

const drawerWidth = 240;

const menuItems = [
    { text: 'Trang chủ', icon: <DashboardIcon />, path: '/' },
    { text: 'Quản lý tài sản', icon: <InventoryIcon />, path: '/assets' },
    { text: 'Điều chuyển tài sản', icon: <CompareArrowsIcon />, path: '/asset-transfers' },
    { text: 'Quản lý xe', icon: <LocalShippingIcon />, path: '/cars' },
    { text: 'Quản lý người dùng', icon: <PeopleIcon />, path: '/users' },
    { text: 'Quản lý đơn vị', icon: <CategoryIcon />, path: '/units' },
    { text: 'Quản lý khu vực', icon: <ApartmentIcon />, path: '/departments' },
    { text: 'Quản lý văn phòng', icon: <BusinessIcon />, path: '/offices' },
    { text: 'Quản lý bộ phận', icon: <CorporateFareIcon />, path: '/teams' },
];

const Sidebar = () => {
    const navigate = useNavigate();
    const location = useLocation();

    return (
        <Drawer
            variant="permanent"
            sx={{
                width: drawerWidth,
                flexShrink: 0,
                '& .MuiDrawer-paper': {
                    width: drawerWidth,
                    boxSizing: 'border-box',
                    backgroundColor: '#c9812e',
                    color: 'white',
                },
            }}
        >
            <Box sx={{ overflow: 'auto' }}>
                <Box sx={{ p: 2, textAlign: 'center' }}>
                    <Typography variant="h6" component="div" sx={{ fontWeight: 'bold', color: 'black' }}>
                        VAN MINH GROUP
                    </Typography>
                </Box>
                <Divider sx={{ backgroundColor: 'rgba(255,255,255,0.12)' }} />
                <List>
                    {menuItems.map((item) => (
                        <ListItem key={item.text} disablePadding>
                            <ListItemButton
                                onClick={() => navigate(item.path)}
                                selected={location.pathname === item.path}
                                sx={{
                                    '&.Mui-selected': {
                                        backgroundColor: 'rgba(255,255,255,0.08)',
                                        '&:hover': {
                                            backgroundColor: 'rgba(255,255,255,0.12)',
                                        },
                                    },
                                    '&:hover': {
                                        backgroundColor: 'rgba(255,255,255,0.04)',
                                    },
                                }}
                            >
                                <ListItemIcon sx={{ color: 'white', minWidth: 40 }}>
                                    {item.icon}
                                </ListItemIcon>
                                <ListItemText 
                                    primary={item.text}
                                    sx={{
                                        '& .MuiListItemText-primary': {
                                            fontSize: '0.9rem',
                                        },
                                    }}
                                />
                            </ListItemButton>
                        </ListItem>
                    ))}
                </List>
            </Box>
        </Drawer>
    );
};

export default Sidebar; 