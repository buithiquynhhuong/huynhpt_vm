import React, { useState, useEffect } from 'react';
import {
    Box,
    Button,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    TextField,
    Typography,
    Paper,
    Alert,
    Snackbar,
} from '@mui/material';
import {
    Add as AddIcon,
} from '@mui/icons-material';
import DataTable from '../components/DataTable';
import axios from 'axios';

const UnitManagement = () => {
    const [units, setUnits] = useState([]);
    const [openDialog, setOpenDialog] = useState(false);
    const [selectedUnit, setSelectedUnit] = useState(null);
    const [snackbar, setSnackbar] = useState({
        open: false,
        message: '',
        severity: 'success'
    });
    const [formData, setFormData] = useState({
        label: '',
    });

    const getAuthConfig = () => {
        const token = localStorage.getItem('token');
        return {
            headers: {
                'Authorization': token
            }
        };
    };

    useEffect(() => {
        fetchUnits();
    }, []);

    const fetchUnits = async () => {
        try {
            const response = await axios.get('http://localhost:3076/api/vanminh/unit', getAuthConfig());
            setUnits(response.data || []);
        } catch (error) {
            showSnackbar('Lỗi khi tải dữ liệu đơn vị', 'error');
        }
    };

    const handleOpenDialog = (unit = null) => {
        if (unit) {
            setSelectedUnit(unit);
            setFormData({
                label: unit.label || '',
            });
        } else {
            setSelectedUnit(null);
            setFormData({
                label: '',
            });
        }
        setOpenDialog(true);
    };

    const handleCloseDialog = () => {
        setOpenDialog(false);
        setSelectedUnit(null);
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleSubmit = async () => {
        try {
            if (selectedUnit) {
                await axios.put(`http://localhost:3076/api/vanminh/unit/${selectedUnit._id}`, formData, getAuthConfig());
                showSnackbar('Cập nhật đơn vị thành công');
            } else {
                await axios.post('http://localhost:3076/api/vanminh/unit', formData, getAuthConfig());
                showSnackbar('Thêm đơn vị thành công');
            }
            handleCloseDialog();
            fetchUnits();
        } catch (error) {
            showSnackbar('Có lỗi xảy ra', 'error');
        }
    };

    const handleDelete = async (id) => {
        try {
            await axios.delete(`http://localhost:3076/api/vanminh/unit/${id}`, getAuthConfig());
            showSnackbar('Xóa đơn vị thành công');
            fetchUnits();
        } catch (error) {
            showSnackbar('Lỗi khi xóa đơn vị', 'error');
        }
    };

    const handleCloseSnackbar = () => {
        setSnackbar(prev => ({ ...prev, open: false }));
    };

    const showSnackbar = (message, severity = 'success') => {
        setSnackbar({ open: true, message, severity });
    };

    const columns = [
        { field: 'label', headerName: 'Tên đơn vị' }
    ];

    return (
        <Box sx={{ p: 3 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
                <Typography variant="h4">Quản lý đơn vị</Typography>
                <Button
                    variant="contained"
                    startIcon={<AddIcon />}
                    onClick={() => handleOpenDialog()}
                >
                    Thêm mới
                </Button>
            </Box>

            <Paper sx={{ mb: 2 }}>
                <DataTable
                    columns={columns}
                    data={units}
                    onEdit={handleOpenDialog}
                    onDelete={handleDelete}
                />
            </Paper>

            <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
                <DialogTitle>
                    {selectedUnit ? 'Cập nhật đơn vị' : 'Thêm mới đơn vị'}
                </DialogTitle>
                <DialogContent>
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 2 }}>
                        <TextField
                            label="Tên đơn vị"
                            name="label"
                            value={formData.label}
                            onChange={handleInputChange}
                            fullWidth
                        />
                    </Box>
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleCloseDialog}>Hủy</Button>
                    <Button onClick={handleSubmit} variant="contained">
                        {selectedUnit ? 'Cập nhật' : 'Thêm mới'}
                    </Button>
                </DialogActions>
            </Dialog>

            <Snackbar
                open={snackbar.open}
                autoHideDuration={3000}
                onClose={handleCloseSnackbar}
                anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
            >
                <Alert
                    onClose={handleCloseSnackbar}
                    severity={snackbar.severity}
                    sx={{ width: '100%' }}
                >
                    {snackbar.message}
                </Alert>
            </Snackbar>
        </Box>
    );
};

export default UnitManagement; 