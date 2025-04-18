import React, { useState, useEffect } from 'react';
import {
    Box,
    Button,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    IconButton,
    Paper,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    TextField,
    Typography,
    Snackbar,
    Alert,
    Tooltip
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import permissionApi from '../../api/permissionApi';
import { tableStyles } from '../styles/TableStyles';

const PermissionList = () => {
    const [permissions, setPermissions] = useState([]);
    const [openDialog, setOpenDialog] = useState(false);
    const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
    const [selectedPermission, setSelectedPermission] = useState(null);
    const [formData, setFormData] = useState({
        name: '',
        description: '',
        code: ''
    });
    const [snackbar, setSnackbar] = useState({
        open: false,
        message: '',
        severity: 'success'
    });

    useEffect(() => {
        fetchPermissions();
    }, []);

    const fetchPermissions = async () => {
        try {
            const response = await permissionApi.getAll();
            setPermissions(response.data);
        } catch (error) {
            showSnackbar('Lỗi khi tải danh sách quyền', 'error');
        }
    };

    const handleOpenDialog = (permission = null) => {
        if (permission) {
            setFormData({
                name: permission.name,
                description: permission.description || '',
                code: permission.code || ''
            });
        } else {
            setFormData({
                name: '',
                description: '',
                code: ''
            });
        }
        setSelectedPermission(permission);
        setOpenDialog(true);
    };

    const handleCloseDialog = () => {
        setOpenDialog(false);
        setSelectedPermission(null);
    };

    const handleOpenDeleteDialog = (permission) => {
        setSelectedPermission(permission);
        setOpenDeleteDialog(true);
    };

    const handleCloseDeleteDialog = () => {
        setOpenDeleteDialog(false);
        setSelectedPermission(null);
    };

    const showSnackbar = (message, severity = 'success') => {
        setSnackbar({
            open: true,
            message,
            severity
        });
    };

    const handleSubmit = async () => {
        try {
            if (selectedPermission) {
                await permissionApi.update(selectedPermission._id, formData);
                showSnackbar('Cập nhật quyền thành công');
            } else {
                await permissionApi.create(formData);
                showSnackbar('Thêm quyền thành công');
            }
            handleCloseDialog();
            fetchPermissions();
        } catch (error) {
            showSnackbar(error.response?.data || 'Có lỗi xảy ra', 'error');
        }
    };

    const handleDelete = async () => {
        try {
            await permissionApi.delete(selectedPermission._id);
            showSnackbar('Xóa quyền thành công');
            handleCloseDeleteDialog();
            fetchPermissions();
        } catch (error) {
            showSnackbar(error.response?.data || 'Có lỗi xảy ra', 'error');
        }
    };

    const handleChange = (event) => {
        const { name, value } = event.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const renderCell = (row) => (
        <Tooltip title={row.someField || ''}>
            <Box sx={tableStyles.cellContent}>
                {row.someField}
            </Box>
        </Tooltip>
    );

    return (
        <Box sx={tableStyles.pageContainer}>
            <Box sx={tableStyles.headerContainer}>
                <Typography variant="h4">Quản lý quyền</Typography>
                <Button
                    variant="contained"
                    startIcon={<AddIcon />}
                    onClick={() => handleOpenDialog()}
                >
                    Thêm quyền
                </Button>
            </Box>
            <Paper sx={tableStyles.paper}>
                <TableContainer>
                    <Table>
                        <TableHead>
                            <TableRow>
                                <TableCell>STT</TableCell>
                                <TableCell>Tên quyền</TableCell>
                                <TableCell>Mã quyền</TableCell>
                                <TableCell>Mô tả</TableCell>
                                <TableCell align="right">Thao tác</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {permissions.map((permission, index) => (
                                <TableRow key={permission._id}>
                                    <TableCell>{index + 1}</TableCell>
                                    <TableCell>{permission.name}</TableCell>
                                    <TableCell>{permission.code}</TableCell>
                                    <TableCell>{permission.description}</TableCell>
                                    <TableCell align="right">
                                        <IconButton onClick={() => handleOpenDialog(permission)} color="primary">
                                            <EditIcon />
                                        </IconButton>
                                        <IconButton onClick={() => handleOpenDeleteDialog(permission)} color="error">
                                            <DeleteIcon />
                                        </IconButton>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </TableContainer>
            </Paper>

            {/* Dialog thêm/sửa quyền */}
            <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
                <DialogTitle>
                    {selectedPermission ? 'Sửa quyền' : 'Thêm quyền'}
                </DialogTitle>
                <DialogContent>
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 2 }}>
                        <TextField
                            label="Tên quyền"
                            name="name"
                            value={formData.name}
                            onChange={handleChange}
                            fullWidth
                        />
                        <TextField
                            label="Mã quyền"
                            name="code"
                            value={formData.code}
                            onChange={handleChange}
                            fullWidth
                        />
                        <TextField
                            label="Mô tả"
                            name="description"
                            value={formData.description}
                            onChange={handleChange}
                            fullWidth
                            multiline
                            rows={3}
                        />
                    </Box>
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleCloseDialog}>Hủy</Button>
                    <Button onClick={handleSubmit} variant="contained">
                        {selectedPermission ? 'Cập nhật' : 'Thêm'}
                    </Button>
                </DialogActions>
            </Dialog>

            {/* Dialog xác nhận xóa */}
            <Dialog open={openDeleteDialog} onClose={handleCloseDeleteDialog}>
                <DialogTitle>Xác nhận xóa</DialogTitle>
                <DialogContent>
                    Bạn có chắc chắn muốn xóa quyền "{selectedPermission?.name}" không?
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleCloseDeleteDialog}>Hủy</Button>
                    <Button onClick={handleDelete} color="error" variant="contained">
                        Xóa
                    </Button>
                </DialogActions>
            </Dialog>

            {/* Snackbar thông báo */}
            <Snackbar
                open={snackbar.open}
                autoHideDuration={3000}
                onClose={() => setSnackbar({ ...snackbar, open: false })}
            >
                <Alert severity={snackbar.severity} onClose={() => setSnackbar({ ...snackbar, open: false })}>
                    {snackbar.message}
                </Alert>
            </Snackbar>
        </Box>
    );
};

export default PermissionList; 