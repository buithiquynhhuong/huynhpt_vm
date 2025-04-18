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
    FormControl,
    InputLabel,
    Select,
    MenuItem,
    Chip,
} from '@mui/material';
import {
    Add as AddIcon,
} from '@mui/icons-material';
import DataTable from '../components/DataTable';
import axios from 'axios';

const DepartmentManagement = () => {
    const [departments, setDepartments] = useState([]);
    const [teams, setTeams] = useState([]);
    const [openDialog, setOpenDialog] = useState(false);
    const [selectedDepartment, setSelectedDepartment] = useState(null);
    const [snackbar, setSnackbar] = useState({
        open: false,
        message: '',
        severity: 'success'
    });
    const [formData, setFormData] = useState({
        code: '',
        label: '',
        teams: []
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
        fetchDepartments();
        fetchTeams();
    }, []);

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

    const handleOpenDialog = (department = null) => {
        if (department) {
            setSelectedDepartment(department);
            setFormData({
                code: department.code || '',
                label: department.label || '',
                teams: department.teams || []
            });
        } else {
            setSelectedDepartment(null);
            setFormData({
                code: '',
                label: '',
                teams: []
            });
        }
        setOpenDialog(true);
    };

    const handleCloseDialog = () => {
        setOpenDialog(false);
        setSelectedDepartment(null);
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleTeamChange = (event) => {
        const {
            target: { value },
        } = event;
        setFormData(prev => ({
            ...prev,
            teams: typeof value === 'string' ? value.split(',') : value,
        }));
    };

    const handleSubmit = async () => {
        try {
            if (selectedDepartment) {
                await axios.put(`http://localhost:3076/api/vanminh/departmant/${selectedDepartment._id}`, formData, getAuthConfig());
                showSnackbar('Cập nhật phòng ban thành công');
            } else {
                await axios.post('http://localhost:3076/api/vanminh/departmant', formData, getAuthConfig());
                showSnackbar('Thêm phòng ban thành công');
            }
            handleCloseDialog();
            fetchDepartments();
        } catch (error) {
            showSnackbar('Có lỗi xảy ra', 'error');
        }
    };

    const handleDelete = async (id) => {
        try {
            await axios.delete(`http://localhost:3076/api/vanminh/departmant/${id}`, getAuthConfig());
            showSnackbar('Xóa phòng ban thành công');
            fetchDepartments();
        } catch (error) {
            showSnackbar('Lỗi khi xóa phòng ban', 'error');
        }
    };

    const handleCloseSnackbar = () => {
        setSnackbar(prev => ({ ...prev, open: false }));
    };

    const showSnackbar = (message, severity = 'success') => {
        setSnackbar({ open: true, message, severity });
    };

    const columns = [
        { field: 'code', headerName: 'Mã phòng ban' },
        { field: 'label', headerName: 'Tên khu vực' },
        { 
            field: 'teams', 
            headerName: 'Bộ Phận',
            width: 200,
            renderCell: (row) => (
                <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap' }}>
                    {Array.isArray(row.teams) && row.teams.map(team => {
                        const teamLabel = typeof team === 'object' ? team.label : team;
                        return teamLabel ? (
                            <Chip 
                                key={team._id || team} 
                                label={teamLabel} 
                                size="small"
                                color="primary"
                                variant="outlined"
                            />
                        ) : null;
                    })}
                </Box>
            )
        }
    ];

    return (
        <Box sx={{ p: 3 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
                <Typography variant="h4">Quản lý phòng ban</Typography>
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
                    data={departments}
                    onEdit={handleOpenDialog}
                    onDelete={handleDelete}
                />
            </Paper>

            <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
                <DialogTitle>
                    {selectedDepartment ? 'Cập nhật phòng ban' : 'Thêm mới phòng ban'}
                </DialogTitle>
                <DialogContent>
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 2 }}>
                        <TextField
                            label="Mã phòng ban"
                            name="code"
                            value={formData.code}
                            onChange={handleInputChange}
                            fullWidth
                        />
                        <TextField
                            label="Tên phòng khu vực"
                            name="label"
                            value={formData.label}
                            onChange={handleInputChange}
                            fullWidth
                        />
                        <FormControl fullWidth>
                            <InputLabel>Teams</InputLabel>
                            <Select
                                multiple
                                value={formData.teams}
                                onChange={handleTeamChange}
                                label="Teams"
                                renderValue={(selected) => (
                                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                                        {selected.map((value) => {
                                            const team = teams.find(t => t._id === value);
                                            return team ? (
                                                <Chip
                                                    key={value}
                                                    label={team.label}
                                                    size="small"
                                                />
                                            ) : null;
                                        })}
                                    </Box>
                                )}
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
                        {selectedDepartment ? 'Cập nhật' : 'Thêm mới'}
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

export default DepartmentManagement; 