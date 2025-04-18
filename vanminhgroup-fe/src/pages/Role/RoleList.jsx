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
    Chip
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import DataTable from '../../components/DataTable';
import roleApi from '../../api/roleApi';
import permissionApi from '../../api/permissionApi';

const RoleList = () => {
    const [roles, setRoles] = useState([]);
    const [permissions, setPermissions] = useState([]);
    const [openDialog, setOpenDialog] = useState(false);
    const [selectedRole, setSelectedRole] = useState(null);
    const [formData, setFormData] = useState({
        name: '',
        description: '',
        permissions: []
    });
    const [snackbar, setSnackbar] = useState({
        open: false,
        message: '',
        severity: 'success'
    });

    useEffect(() => {
        fetchRoles();
        fetchPermissions();
    }, []);

    const fetchRoles = async () => {
        try {
            const response = await roleApi.getAll();
            setRoles(response.data);
        } catch (error) {
            showSnackbar('Lỗi khi tải danh sách vai trò', 'error');
        }
    };

    const fetchPermissions = async () => {
        try {
            const response = await permissionApi.getAll();
            setPermissions(response.data);
        } catch (error) {
            showSnackbar('Lỗi khi tải danh sách quyền', 'error');
        }
    };

    const handleOpenDialog = (role = null) => {
        if (role) {
            setFormData({
                name: role.name,
                description: role.description || '',
                permissions: role.permissions || []
            });
        } else {
            setFormData({
                name: '',
                description: '',
                permissions: []
            });
        }
        setSelectedRole(role);
        setOpenDialog(true);
    };

    const handleCloseDialog = () => {
        setOpenDialog(false);
        setSelectedRole(null);
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handlePermissionChange = (event) => {
        const {
            target: { value },
        } = event;
        setFormData(prev => ({
            ...prev,
            permissions: typeof value === 'string' ? value.split(',') : value,
        }));
    };

    const handleSubmit = async () => {
        try {
            if (selectedRole) {
                await roleApi.update(selectedRole._id, formData);
                showSnackbar('Cập nhật vai trò thành công');
            } else {
                await roleApi.create(formData);
                showSnackbar('Thêm vai trò thành công');
            }
            handleCloseDialog();
            fetchRoles();
        } catch (error) {
            showSnackbar('Có lỗi xảy ra', 'error');
        }
    };

    const handleDelete = async (id) => {
        try {
            await roleApi.delete(id);
            showSnackbar('Xóa vai trò thành công');
            fetchRoles();
        } catch (error) {
            showSnackbar('Lỗi khi xóa vai trò', 'error');
        }
    };

    const handleCloseSnackbar = () => {
        setSnackbar(prev => ({ ...prev, open: false }));
    };

    const showSnackbar = (message, severity = 'success') => {
        setSnackbar({ open: true, message, severity });
    };

    const columns = [
        { field: 'name', headerName: 'Tên vai trò' },
        { field: 'description', headerName: 'Mô tả' },
        { 
            field: 'permissions', 
            headerName: 'Quyền',
            renderCell: (row) => (
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                    {row.permissions?.map((permissionId) => {
                        const permission = permissions.find(p => p._id === permissionId);
                        return permission ? (
                            <Chip
                                key={permissionId}
                                label={permission.name}
                                size="small"
                            />
                        ) : null;
                    })}
                </Box>
            )
        }
    ];

    return (
        <Box p={3}>
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
                <Typography variant="h5">Quản lý vai trò</Typography>
                <Button
                    variant="contained"
                    startIcon={<AddIcon />}
                    onClick={() => handleOpenDialog()}
                >
                    Thêm vai trò
                </Button>
            </Box>

            <Paper sx={{ mb: 2 }}>
                <DataTable
                    columns={columns}
                    data={roles}
                    onEdit={handleOpenDialog}
                    onDelete={handleDelete}
                />
            </Paper>

            <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
                <DialogTitle>
                    {selectedRole ? 'Cập nhật vai trò' : 'Thêm mới vai trò'}
                </DialogTitle>
                <DialogContent>
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 2 }}>
                        <TextField
                            label="Tên vai trò"
                            name="name"
                            value={formData.name}
                            onChange={handleInputChange}
                            fullWidth
                        />
                        <TextField
                            label="Mô tả"
                            name="description"
                            value={formData.description}
                            onChange={handleInputChange}
                            fullWidth
                            multiline
                            rows={2}
                        />
                        <FormControl fullWidth>
                            <InputLabel>Quyền</InputLabel>
                            <Select
                                multiple
                                name="permissions"
                                value={formData.permissions}
                                onChange={handlePermissionChange}
                                label="Quyền"
                                renderValue={(selected) => (
                                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                                        {selected.map((value) => {
                                            const permission = permissions.find(p => p._id === value);
                                            return permission ? (
                                                <Chip
                                                    key={value}
                                                    label={permission.name}
                                                    size="small"
                                                />
                                            ) : null;
                                        })}
                                    </Box>
                                )}
                            >
                                {permissions.map((permission) => (
                                    <MenuItem key={permission._id} value={permission._id}>
                                        {permission.name}
                                    </MenuItem>
                                ))}
                            </Select>
                        </FormControl>
                    </Box>
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleCloseDialog}>Hủy</Button>
                    <Button onClick={handleSubmit} variant="contained">
                        {selectedRole ? 'Cập nhật' : 'Thêm mới'}
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

export default RoleList; 