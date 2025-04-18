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

const TeamManagement = () => {
    const [teams, setTeams] = useState([]);
    const [departments, setDepartments] = useState([]);
    const [openDialog, setOpenDialog] = useState(false);
    const [selectedTeam, setSelectedTeam] = useState(null);
    const [snackbar, setSnackbar] = useState({
        open: false,
        message: '',
        severity: 'success'
    });
    const [formData, setFormData] = useState({
        code: '',
        label: '',
        departmentID: '',
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
        fetchTeams();
        fetchDepartments();
    }, []);

    const fetchTeams = async () => {
        try {
            const response = await axios.get('http://localhost:3076/api/vanminh/team', getAuthConfig());
            setTeams(response.data || []);
        } catch (error) {
            showSnackbar('Lỗi khi tải dữ liệu team', 'error');
        }
    };

    const fetchDepartments = async () => {
        try {
            const response = await axios.get('http://localhost:3076/api/vanminh/departmant', getAuthConfig());
            setDepartments(response.data || []);
        } catch (error) {
            showSnackbar('Lỗi khi tải dữ liệu khu vực', 'error');
        }
    };

    const handleOpenDialog = (team = null) => {
        if (team) {
            setSelectedTeam(team);
            setFormData({
                code: team.code || '',
                label: team.label || '',
                departmentID: team.departmentID || '',
            });
        } else {
            setSelectedTeam(null);
            setFormData({
                code: '',
                label: '',
                departmentID: '',
            });
        }
        setOpenDialog(true);
    };

    const handleCloseDialog = () => {
        setOpenDialog(false);
        setSelectedTeam(null);
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
            if (selectedTeam) {
                await axios.put(`http://localhost:3076/api/vanminh/team/${selectedTeam._id}`, formData, getAuthConfig());
                showSnackbar('Cập nhật team thành công');
            } else {
                await axios.post('http://localhost:3076/api/vanminh/team', formData, getAuthConfig());
                showSnackbar('Thêm team thành công');
            }
            handleCloseDialog();
            fetchTeams();
        } catch (error) {
            showSnackbar('Có lỗi xảy ra', 'error');
        }
    };

    const handleDelete = async (id) => {
        try {
            await axios.delete(`http://localhost:3076/api/vanminh/team/${id}`, getAuthConfig());
            showSnackbar('Xóa team thành công');
            fetchTeams();
        } catch (error) {
            showSnackbar('Lỗi khi xóa team', 'error');
        }
    };

    const handleCloseSnackbar = () => {
        setSnackbar(prev => ({ ...prev, open: false }));
    };

    const showSnackbar = (message, severity = 'success') => {
        setSnackbar({ open: true, message, severity });
    };

    const columns = [
        { field: 'code', headerName: 'Mã bộ phận' },
        { field: 'label', headerName: 'Tên bộ phận' },
        { 
            field: 'departmentID', 
            headerName: 'Khu vực',
            renderCell: (row) => departments.find(d => d._id === row.departmentID)?.label || ''
        }
    ];

    return (
        <Box sx={{ p: 3 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
                <Typography variant="h4">Quản lý team</Typography>
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
                    data={teams}
                    onEdit={handleOpenDialog}
                    onDelete={handleDelete}
                />
            </Paper>

            <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
                <DialogTitle>
                    {selectedTeam ? 'Cập nhật team' : 'Thêm mới team'}
                </DialogTitle>
                <DialogContent>
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 2 }}>
                        <TextField
                            label="Mã team"
                            name="code"
                            value={formData.code}
                            onChange={handleInputChange}
                            fullWidth
                        />
                        <TextField
                            label="Tên team"
                            name="label"
                            value={formData.label}
                            onChange={handleInputChange}
                            fullWidth
                        />
                        <FormControl fullWidth>
                            <InputLabel>Khu vực</InputLabel>
                            <Select
                                name="departmentID"
                                value={formData.departmentID}
                                onChange={handleInputChange}
                                label="Khu vực"
                            >
                                {departments.map((department) => (
                                    <MenuItem key={department._id} value={department._id}>
                                        {department.label}
                                    </MenuItem>
                                ))}
                            </Select>
                        </FormControl>
                    </Box>
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleCloseDialog}>Hủy</Button>
                    <Button onClick={handleSubmit} variant="contained">
                        {selectedTeam ? 'Cập nhật' : 'Thêm mới'}
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

export default TeamManagement; 