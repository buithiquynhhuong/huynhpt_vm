import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import Layout from './components/Layout';
import Login from './pages/Login';
import UserManagement from './pages/UserManagement';
import UnitManagement from './pages/UnitManagement';
import DepartmentManagement from './pages/DepartmentManagement';
import OfficeManagement from './pages/OfficeManagement';
import TeamManagement from './pages/TeamManagement';
import CarManagement from './pages/CarManagement';
import AssetManagement from './pages/AssetManagement';
import AssetTransferHistory from './pages/AssetTransferHistory';
import Dashboard from './pages/Dashboard';
import { SnackbarProvider } from 'notistack';

// Tạo theme mới với màu vàng dễ nhìn
const theme = createTheme({
  palette: {
    primary: {
      main: '#FFC107', // Màu vàng chính
      light: '#FFD54F',
      dark: '#FFA000',
      contrastText: '#000000', // Chữ đen trên nền vàng
    },
    secondary: {
      main: '#FF9800', // Màu cam
      light: '#FFB74D',
      dark: '#F57C00',
      contrastText: '#000000',
    },
    background: {
      default: '#FFF8E1', // Màu nền vàng nhạt
      paper: '#FFFFFF',
    },
    text: {
      primary: '#212121', // Màu chữ đen
      secondary: '#424242',
    },
    error: {
      main: '#F44336',
    },
    warning: {
      main: '#FF9800',
    },
    info: {
      main: '#2196F3',
    },
    success: {
      main: '#4CAF50',
    },
  },
  typography: {
    fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
    h1: {
      fontSize: '2.5rem',
      fontWeight: 500,
      color: '#212121',
    },
    h2: {
      fontSize: '2rem',
      fontWeight: 500,
      color: '#212121',
    },
    h3: {
      fontSize: '1.75rem',
      fontWeight: 500,
      color: '#212121',
    },
    h4: {
      fontSize: '1.5rem',
      fontWeight: 500,
      color: '#212121',
    },
    h5: {
      fontSize: '1.25rem',
      fontWeight: 500,
      color: '#212121',
    },
    h6: {
      fontSize: '1rem',
      fontWeight: 500,
      color: '#212121',
    },
    body1: {
      fontSize: '1rem',
      lineHeight: 1.5,
    },
    button: {
      textTransform: 'none',
      fontWeight: 500,
    },
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          padding: '8px 16px',
          fontWeight: 500,
        },
        contained: {
          boxShadow: 'none',
          '&:hover': {
            boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
          },
        },
        outlined: {
          borderWidth: 2,
          '&:hover': {
            borderWidth: 2,
          },
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 12,
          boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
          '&:hover': {
            boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
          },
        },
      },
    },
    MuiAppBar: {
      styleOverrides: {
        root: {
          boxShadow: 'none',
          borderBottom: '1px solid rgba(0,0,0,0.1)',
        },
      },
    },
    MuiDrawer: {
      styleOverrides: {
        paper: {
          borderRight: 'none',
          boxShadow: '2px 0 8px rgba(0,0,0,0.1)',
        },
      },
    },
    MuiListItemButton: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          margin: '4px 8px',
          '&:hover': {
            backgroundColor: 'rgba(255,255,255,0.1)',
          },
        },
      },
    },
    MuiTextField: {
      styleOverrides: {
        root: {
          '& .MuiOutlinedInput-root': {
            borderRadius: 8,
          },
        },
      },
    },
  },
  shape: {
    borderRadius: 8,
  },
});

function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <SnackbarProvider
        maxSnack={3}
        anchorOrigin={{
          vertical: 'top',
          horizontal: 'right',
        }}
        autoHideDuration={3000}
      >
        <Router>
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route element={<Layout />}>
              <Route path="/" element={<Dashboard />} />
              <Route path="/users" element={<UserManagement />} />
              <Route path="/units" element={<UnitManagement />} />
              <Route path="/departments" element={<DepartmentManagement />} />
              <Route path="/offices" element={<OfficeManagement />} />
              <Route path="/teams" element={<TeamManagement />} />
              <Route path="/cars" element={<CarManagement />} />
              <Route path="/assets" element={<AssetManagement />} />
              <Route path="/asset-transfers" element={<AssetTransferHistory />} />
            </Route>
          </Routes>
        </Router>
      </SnackbarProvider>
    </ThemeProvider>
  );
}

export default App; 