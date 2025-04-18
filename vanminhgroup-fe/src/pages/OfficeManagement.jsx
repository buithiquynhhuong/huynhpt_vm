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
    FormControl,
    InputLabel,
    Select,
    MenuItem,
    Alert,
    Snackbar,
} from '@mui/material';
import {
    Add as AddIcon,
} from '@mui/icons-material';
import DataTable from '../components/DataTable';
import axios from 'axios';

const OfficeManagement = () => {
    const [offices, setOffices] = useState([]);
    const [departments, setDepartments] = useState([]);
    const [teams, setTeams] = useState([]);
    const [openDialog, setOpenDialog] = useState(false);
    const [selectedOffice, setSelectedOffice] = useState(null);
    const [snackbar, setSnackbar] = useState({
        open: false,
        message: '',
        severity: 'success'
    });
    const [formData, setFormData] = useState({
        code: '',
        label: '',
        departmentID: '',
        teamID: '',
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
        fetchOffices();
        fetchDepartments();
        fetchTeams();
    }, []);

    const fetchOffices = async () => {
        try {
            const response = await axios.get('http://localhost:3076/api/vanminh/office', getAuthConfig());
            setOffices(response.data || []);
        } catch (error) {
            showSnackbar('Lỗi khi tải dữ liệu văn phòng', 'error');
        }
    };

    const fetchDepartments = async () => {
        try {
            const response = await axios.get('http://localhost:3076/api/vanminh/departmant', getAuthConfig());
            setDepartments(response.data || []);
        } catch (error) {
            showSnackbar('Lỗi khi tải dữ liệu phòng ban', 'error');
        }
    };

    const fetchTeams = async () => {
        try {
            const response = await axios.get('http://localhost:3076/api/vanminh/team', getAuthConfig());
            setTeams(response.data || []);
        } catch (error) {
            showSnackbar('Lỗi khi tải dữ liệu team', 'error');
        }
    };

    const handleOpenDialog = (office = null) => {
        if (office) {
            setSelectedOffice(office);
            setFormData({
                code: office.code || '',
                label: office.label || '',
                departmentID: office.departmentID || '',
                teamID: office.teamID || '',
            });
        } else {
            setSelectedOffice(null);
            setFormData({
                code: '',
                label: '',
                departmentID: '',
                teamID: '',
            });
        }
        setOpenDialog(true);
    };

    const handleCloseDialog = () => {
        setOpenDialog(false);
        setSelectedOffice(null);
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
            if (selectedOffice) {
                await axios.put(`http://localhost:3076/api/vanminh/office/${selectedOffice._id}`, formData, getAuthConfig());
                showSnackbar('Cập nhật văn phòng thành công');
            } else {
                await axios.post('http://localhost:3076/api/vanminh/office', formData, getAuthConfig());
                showSnackbar('Thêm văn phòng thành công');
            }
            handleCloseDialog();
            fetchOffices();
        } catch (error) {
            showSnackbar('Có lỗi xảy ra', 'error');
        }
    };

    const handleDelete = async (id) => {
        try {
            await axios.delete(`http://localhost:3076/api/vanminh/office/${id}`, getAuthConfig());
            showSnackbar('Xóa văn phòng thành công');
            fetchOffices();
        } catch (error) {
            showSnackbar('Lỗi khi xóa văn phòng', 'error');
        }
    };

    const handleCloseSnackbar = () => {
        setSnackbar(prev => ({ ...prev, open: false }));
    };

    const showSnackbar = (message, severity = 'success') => {
        setSnackbar({ open: true, message, severity });
    };

    const columns = [
        { field: 'code', headerName: 'Mã văn phòng' },
        { field: 'label', headerName: 'Tên văn phòng' },
        { 
            field: 'departmentID', 
            headerName: 'Khu vực',
            renderCell: (row) => departments.find(d => d._id === row.departmentID)?.label || ''
        },
        { 
            field: 'teamID', 
            headerName: 'Bộ Phận',
            renderCell: (row) => teams.find(t => t._id === row.teamID)?.label || ''
        }
    ];

    return (
        <Box sx={{ p: 3 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
                <Typography variant="h4">Quản lý văn phòng</Typography>
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
                    data={offices}
                    onEdit={handleOpenDialog}
                    onDelete={handleDelete}
                />
            </Paper>

            <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
                <DialogTitle>
                    {selectedOffice ? 'Cập nhật văn phòng' : 'Thêm mới văn phòng'}
                </DialogTitle>
                <DialogContent>
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 2 }}>
                        <TextField
                            label="Mã văn phòng"
                            name="code"
                            value={formData.code}
                            onChange={handleInputChange}
                            fullWidth
                        />
                        <TextField
                            label="Tên văn phòng"
                            name="label"
                            value={formData.label}
                            onChange={handleInputChange}
                            fullWidth
                        />
                        <FormControl fullWidth>
                            <InputLabel>Phòng ban</InputLabel>
                            <Select
                                name="departmentID"
                                value={formData.departmentID}
                                onChange={handleInputChange}
                                label="Phòng ban"
                            >
                                {departments.map((department) => (
                                    <MenuItem key={department._id} value={department._id}>
                                        {department.label}
                                    </MenuItem>
                                ))}
                            </Select>
                        </FormControl>
                        <FormControl fullWidth>
                            <InputLabel>Team</InputLabel>
                            <Select
                                name="teamID"
                                value={formData.teamID}
                                onChange={handleInputChange}
                                label="Team"
                            >
                                {teams.map((team) => (
                                    <MenuItem key={team._id} value={team._id}>
                                        {team.label}
                                    </MenuItem>
                                ))}
                            </Select>
                        </FormControl>
                    </Box>
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleCloseDialog}>Hủy</Button>
                    <Button onClick={handleSubmit} variant="contained">
                        {selectedOffice ? 'Cập nhật' : 'Thêm mới'}
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

export default OfficeManagement; 