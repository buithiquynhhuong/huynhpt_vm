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
    Alert
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import unitApi from '../../api/unitApi';

const UnitList = () => {
    const [units, setUnits] = useState([]);
    const [openDialog, setOpenDialog] = useState(false);
    const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
    const [selectedUnit, setSelectedUnit] = useState(null);
    const [unitName, setUnitName] = useState('');
    const [snackbar, setSnackbar] = useState({
        open: false,
        message: '',
        severity: 'success'
    });

    useEffect(() => {
        fetchUnits();
    }, []);

    const fetchUnits = async () => {
        try {
            const response = await unitApi.getAll();
            setUnits(response.data);
        } catch (error) {
            showSnackbar('Lỗi khi tải danh sách đơn vị', 'error');
        }
    };

    const handleOpenDialog = (unit = null) => {
        setSelectedUnit(unit);
        setUnitName(unit ? unit.label : '');
        setOpenDialog(true);
    };

    const handleCloseDialog = () => {
        setOpenDialog(false);
        setSelectedUnit(null);
        setUnitName('');
    };

    const handleOpenDeleteDialog = (unit) => {
        setSelectedUnit(unit);
        setOpenDeleteDialog(true);
    };

    const handleCloseDeleteDialog = () => {
        setOpenDeleteDialog(false);
        setSelectedUnit(null);
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
            if (selectedUnit) {
                await unitApi.update(selectedUnit._id, { label: unitName });
                showSnackbar('Cập nhật đơn vị thành công');
            } else {
                await unitApi.create({ label: unitName });
                showSnackbar('Thêm đơn vị thành công');
            }
            handleCloseDialog();
            fetchUnits();
        } catch (error) {
            showSnackbar(error.response?.data || 'Có lỗi xảy ra', 'error');
        }
    };

    const handleDelete = async () => {
        try {
            await unitApi.delete(selectedUnit._id);
            showSnackbar('Xóa đơn vị thành công');
            handleCloseDeleteDialog();
            fetchUnits();
        } catch (error) {
            showSnackbar(error.response?.data || 'Có lỗi xảy ra', 'error');
        }
    };

    return (
        <Box p={3}>
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
                <Typography variant="h5">Quản lý đơn vị</Typography>
                <Button
                    variant="contained"
                    startIcon={<AddIcon />}
                    onClick={() => handleOpenDialog()}
                >
                    Thêm đơn vị
                </Button>
            </Box>

            <TableContainer component={Paper}>
                <Table>
                    <TableHead>
                        <TableRow>
                            <TableCell>STT</TableCell>
                            <TableCell>Tên đơn vị</TableCell>
                            <TableCell align="right">Thao tác</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {units.map((unit, index) => (
                            <TableRow key={unit._id}>
                                <TableCell>{index + 1}</TableCell>
                                <TableCell>{unit.label}</TableCell>
                                <TableCell align="right">
                                    <IconButton onClick={() => handleOpenDialog(unit)} color="primary">
                                        <EditIcon />
                                    </IconButton>
                                    <IconButton onClick={() => handleOpenDeleteDialog(unit)} color="error">
                                        <DeleteIcon />
                                    </IconButton>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </TableContainer>

            {/* Dialog thêm/sửa đơn vị */}
            <Dialog open={openDialog} onClose={handleCloseDialog}>
                <DialogTitle>
                    {selectedUnit ? 'Sửa đơn vị' : 'Thêm đơn vị'}
                </DialogTitle>
                <DialogContent>
                    <TextField
                        autoFocus
                        margin="dense"
                        label="Tên đơn vị"
                        fullWidth
                        value={unitName}
                        onChange={(e) => setUnitName(e.target.value)}
                    />
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleCloseDialog}>Hủy</Button>
                    <Button onClick={handleSubmit} variant="contained">
                        {selectedUnit ? 'Cập nhật' : 'Thêm'}
                    </Button>
                </DialogActions>
            </Dialog>

            {/* Dialog xác nhận xóa */}
            <Dialog open={openDeleteDialog} onClose={handleCloseDeleteDialog}>
                <DialogTitle>Xác nhận xóa</DialogTitle>
                <DialogContent>
                    Bạn có chắc chắn muốn xóa đơn vị "{selectedUnit?.label}" không?
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

export default UnitList; 