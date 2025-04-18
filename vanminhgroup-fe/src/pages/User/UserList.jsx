import React, { useState, useEffect } from 'react';
import {
    Box,
    Button,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    TextField,
    Typography,
    Paper,
    Snackbar,
    Alert,
    FormControl,
    InputLabel,
    Select,
    MenuItem,
    Switch,
    FormControlLabel
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import DataTable from '../../components/DataTable';
import userApi from '../../api/userApi';
import roleApi from '../../api/roleApi';

const UserList = () => {
    const [users, setUsers] = useState([]);
    const [roles, setRoles] = useState([]);
    const [openDialog, setOpenDialog] = useState(false);
    const [selectedUser, setSelectedUser] = useState(null);
    const [formData, setFormData] = useState({
        phone: '',
        password: '',
        name: '',
        email: '',
        position: '',
        status: true,
        ruler: []
    });
    const [snackbar, setSnackbar] = useState({
        open: false,
        message: '',
        severity: 'success'
    });

    useEffect(() => {
        fetchUsers();
        fetchRoles();
    }, []);

    const fetchUsers = async () => {
        try {
            const response = await userApi.getAll();
            setUsers(response.data.account);
        } catch (error) {
            showSnackbar('Lỗi khi tải danh sách người dùng', 'error');
        }
    };

    const fetchRoles = async () => {
        try {
            const response = await roleApi.getAll();
            setRoles(response.data);
        } catch (error) {
            showSnackbar('Lỗi khi tải danh sách vai trò', 'error');
        }
    };

    const handleOpenDialog = (user = null) => {
        if (user) {
            setFormData({
                phone: user.phone || '',
                password: '',
                name: user.name || '',
                email: user.email || '',
                position: user.position || '',
                status: user.status || true,
                ruler: user.ruler || []
            });
        } else {
            setFormData({
                phone: '',
                password: '',
                name: '',
                email: '',
                position: '',
                status: true,
                ruler: []
            });
        }
        setSelectedUser(user);
        setOpenDialog(true);
    };

    const handleCloseDialog = () => {
        setOpenDialog(false);
        setSelectedUser(null);
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleStatusChange = (e) => {
        setFormData(prev => ({
            ...prev,
            status: e.target.checked
        }));
    };

    const handleRoleChange = (event) => {
        const {
            target: { value },
        } = event;
        setFormData(prev => ({
            ...prev,
            ruler: typeof value === 'string' ? value.split(',') : value,
        }));
    };

    const handleSubmit = async () => {
        try {
            if (selectedUser) {
                await userApi.update(selectedUser._id, formData);
                showSnackbar('Cập nhật người dùng thành công');
            } else {
                await userApi.create(formData);
                showSnackbar('Thêm người dùng thành công');
            }
            handleCloseDialog();
            fetchUsers();
        } catch (error) {
            showSnackbar('Có lỗi xảy ra', 'error');
        }
    };

    const handleDelete = async (id) => {
        try {
            await userApi.delete(id);
            showSnackbar('Xóa người dùng thành công');
            fetchUsers();
        } catch (error) {
            showSnackbar('Lỗi khi xóa người dùng', 'error');
        }
    };

    const handleCloseSnackbar = () => {
        setSnackbar(prev => ({ ...prev, open: false }));
    };

    const showSnackbar = (message, severity = 'success') => {
        setSnackbar({ open: true, message, severity });
    };

    const columns = [
        { field: 'name', headerName: 'Tên' },
        { field: 'phone', headerName: 'Số điện thoại' },
        { field: 'email', headerName: 'Email' },
        { field: 'position', headerName: 'Chức vụ' },
        { 
            field: 'status', 
            headerName: 'Trạng thái',
            renderCell: (row) => row.status ? 'Hoạt động' : 'Không hoạt động'
        }
    ];

    return (
        <Box p={3}>
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
                <Typography variant="h5">Quản lý người dùng</Typography>
                <Button
                    variant="contained"
                    startIcon={<AddIcon />}
                    onClick={() => handleOpenDialog()}
                >
                    Thêm người dùng
                </Button>
            </Box>

            <Paper sx={{ mb: 2 }}>
                <DataTable
                    columns={columns}
                    data={users}
                    onEdit={handleOpenDialog}
                    onDelete={handleDelete}
                />
            </Paper>

            <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
                <DialogTitle>
                    {selectedUser ? 'Cập nhật người dùng' : 'Thêm mới người dùng'}
                </DialogTitle>
                <DialogContent>
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 2 }}>
                        <TextField
                            label="Tên"
                            name="name"
                            value={formData.name}
                            onChange={handleInputChange}
                            fullWidth
                        />
                        <TextField
                            label="Số điện thoại"
                            name="phone"
                            value={formData.phone}
                            onChange={handleInputChange}
                            fullWidth
                        />
                        <TextField
                            label="Email"
                            name="email"
                            value={formData.email}
                            onChange={handleInputChange}
                            fullWidth
                        />
                        <TextField
                            label="Chức vụ"
                            name="position"
                            value={formData.position}
                            onChange={handleInputChange}
                            fullWidth
                        />
                        <FormControl fullWidth>
                            <InputLabel>Vai trò</InputLabel>
                            <Select
                                multiple
                                name="ruler"
                                value={formData.ruler}
                                onChange={handleRoleChange}
                                label="Vai trò"
                                renderValue={(selected) => (
                                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                                        {selected.map((value) => {
                                            const role = roles.find(r => r._id === value);
                                            return role ? (
                                                <MenuItem key={value} value={value}>
                                                    {role.name}
                                                </MenuItem>
                                            ) : null;
                                        })}
                                    </Box>
                                )}
                            >
                                {roles.map((role) => (
                                    <MenuItem key={role._id} value={role._id}>
                                        {role.name}
                                    </MenuItem>
                                ))}
                            </Select>
                        </FormControl>
                        <FormControlLabel
                            control={
                                <Switch
                                    checked={formData.status}
                                    onChange={handleStatusChange}
                                    name="status"
                                />
                            }
                            label="Trạng thái hoạt động"
                        />
                        {!selectedUser && (
                            <TextField
                                label="Mật khẩu"
                                name="password"
                                type="password"
                                value={formData.password}
                                onChange={handleInputChange}
                                fullWidth
                            />
                        )}
                    </Box>
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleCloseDialog}>Hủy</Button>
                    <Button onClick={handleSubmit} variant="contained">
                        {selectedUser ? 'Cập nhật' : 'Thêm mới'}
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

export default UserList; 