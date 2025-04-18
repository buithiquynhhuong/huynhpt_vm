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
    TableContainer,
    Tooltip,
    FormControl,
    InputLabel,
    Select,
    MenuItem
} from '@mui/material';
import {
    Add as AddIcon,
} from '@mui/icons-material';
import DataTable from '../components/DataTable';
import { tableStyles } from '../styles/TableStyles';
import axios from 'axios';

const CarManagement = () => {
    const [cars, setCars] = useState([]);
    const [teams, setTeams] = useState([]);
    const [openDialog, setOpenDialog] = useState(false);
    const [selectedCar, setSelectedCar] = useState(null);
    const [pagination, setPagination] = useState({
        page: 1,
        limit: 10,
        total: 0
    });
    const [snackbar, setSnackbar] = useState({
        open: false,
        message: '',
        severity: 'success'
    });
    const [formData, setFormData] = useState({
        carType: '',
        bks: '',
        team: '',
        yearOfManufacture: '',
        registrationPeriod: '',
        registrationName: '',
        valuation: '',
        insurancePeriodTNDS: '',
        insuranceSellerTNDS: '',
        insurancePeriodBHVC: '',
        insuranceSellerBHVC: '',
        insurancePeriodGPS: '',
        descriptionGPS: '',
        insurancePeriod4G: '',
        insuranceSeller4G: '',
        description: ''
    });

    const getAuthConfig = () => {
        const token = localStorage.getItem('token');
        return {
            headers: {
                'Authorization': token
            }
        };
    };

    const fetchCars = async (page = 1, limit = 10) => {
        try {
            const response = await axios.get(`http://localhost:3076/api/vanminh/car?page=${page}&limit=${limit}`, getAuthConfig());
            console.log('API Response:', response);
            console.log('Cars Data:', response.data);
            setCars(response.data.data || []);
            setPagination(prev => ({
                ...prev,
                total: response.data.total || 0,
                page: page,
                limit: limit
            }));
        } catch (error) {
            console.error('Error fetching cars:', error);
            showSnackbar('Lỗi khi tải dữ liệu xe', 'error');
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

    useEffect(() => {
        fetchCars(pagination.page, pagination.limit);
        fetchTeams();
    }, []);

    const formatDate = (dateString) => {
        if (!dateString) return '';
        return new Date(dateString).toLocaleDateString('vi-VN');
    };

    const columns = [
        { 
            field: 'carType', 
            headerName: 'Loại xe',
            width: 120,
            renderCell: (row) => (
                <Tooltip title={row.carType || ''}>
                    <Box sx={tableStyles.cellContent}>
                        {row.carType}
                    </Box>
                </Tooltip>
            )
        },
        { 
            field: 'bks', 
            headerName: 'Biển số xe',
            width: 120,
            renderCell: (row) => (
                <Tooltip title={row.bks || ''}>
                    <Box sx={tableStyles.cellContent}>
                        {row.bks}
                    </Box>
                </Tooltip>
            )
        },
        { 
            field: 'team', 
            headerName: 'Team',
            width: 150,
            renderCell: (row) => (
                <Tooltip title={row.team?.label || ''}>
                    <Box sx={tableStyles.cellContent}>
                        {row.team?.label || ''}
                    </Box>
                </Tooltip>
            )
        },
        { 
            field: 'yearOfManufacture', 
            headerName: 'Năm SX',
            width: 100,
            renderCell: (row) => formatDate(row.yearOfManufacture)
        },
        { 
            field: 'registrationPeriod', 
            headerName: 'Hạn đăng kiểm',
            width: 120,
            renderCell: (row) => formatDate(row.registrationPeriod)
        },
        { 
            field: 'registrationName', 
            headerName: 'Tên đăng kiểm',
            width: 150,
            renderCell: (row) => (
                <Tooltip title={row.registrationName || ''}>
                    <Box sx={tableStyles.cellContent}>
                        {row.registrationName}
                    </Box>
                </Tooltip>
            )
        },
        { 
            field: 'valuation', 
            headerName: 'Định giá',
            width: 120,
            align: 'right',
            renderCell: (row) => new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(row.valuation)
        }
    ];

    const handleOpenDialog = (car = null) => {
        if (car) {
            setSelectedCar(car);
            setFormData({
                carType: car.carType || '',
                bks: car.bks || '',
                team: car.team?._id || '',
                yearOfManufacture: car.yearOfManufacture ? car.yearOfManufacture.split('T')[0] : '',
                registrationPeriod: car.registrationPeriod ? car.registrationPeriod.split('T')[0] : '',
                registrationName: car.registrationName || '',
                valuation: car.valuation || '',
                insurancePeriodTNDS: car.insurancePeriodTNDS ? car.insurancePeriodTNDS.split('T')[0] : '',
                insuranceSellerTNDS: car.insuranceSellerTNDS || '',
                insurancePeriodBHVC: car.insurancePeriodBHVC ? car.insurancePeriodBHVC.split('T')[0] : '',
                insuranceSellerBHVC: car.insuranceSellerBHVC || '',
                insurancePeriodGPS: car.insurancePeriodGPS ? car.insurancePeriodGPS.split('T')[0] : '',
                descriptionGPS: car.descriptionGPS || '',
                insurancePeriod4G: car.insurancePeriod4G ? car.insurancePeriod4G.split('T')[0] : '',
                insuranceSeller4G: car.insuranceSeller4G || '',
                description: car.description || ''
            });
        } else {
            setSelectedCar(null);
            setFormData({
                carType: '',
                bks: '',
                team: '',
                yearOfManufacture: '',
                registrationPeriod: '',
                registrationName: '',
                valuation: '',
                insurancePeriodTNDS: '',
                insuranceSellerTNDS: '',
                insurancePeriodBHVC: '',
                insuranceSellerBHVC: '',
                insurancePeriodGPS: '',
                descriptionGPS: '',
                insurancePeriod4G: '',
                insuranceSeller4G: '',
                description: ''
            });
        }
        setOpenDialog(true);
    };

    const handleCloseDialog = () => {
        setOpenDialog(false);
        setSelectedCar(null);
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
            if (selectedCar) {
                await axios.put(`http://localhost:3076/api/vanminh/car/${selectedCar._id}`, formData, getAuthConfig());
                showSnackbar('Cập nhật xe thành công');
            } else {
                await axios.post('http://localhost:3076/api/vanminh/car', formData, getAuthConfig());
                showSnackbar('Thêm xe thành công');
            }
            handleCloseDialog();
            fetchCars(pagination.page, pagination.limit);
        } catch (error) {
            showSnackbar('Có lỗi xảy ra', 'error');
        }
    };

    const handleDelete = async (id) => {
        try {
            await axios.delete(`http://localhost:3076/api/vanminh/car/${id}`, getAuthConfig());
            showSnackbar('Xóa xe thành công');
            fetchCars(pagination.page, pagination.limit);
        } catch (error) {
            showSnackbar('Lỗi khi xóa xe', 'error');
        }
    };

    const handlePageChange = (newPage) => {
        fetchCars(newPage, pagination.limit);
    };

    const handleLimitChange = (newLimit) => {
        fetchCars(1, newLimit);
    };

    const handleCloseSnackbar = () => {
        setSnackbar(prev => ({ ...prev, open: false }));
    };

    const showSnackbar = (message, severity = 'success') => {
        setSnackbar({ open: true, message, severity });
    };

    return (
        <Box sx={tableStyles.pageContainer}>
            <Box sx={tableStyles.headerContainer}>
                <Typography variant="h4">Quản lý xe</Typography>
                <Button
                    variant="contained"
                    startIcon={<AddIcon />}
                    onClick={() => handleOpenDialog()}
                >
                    Thêm mới
                </Button>
            </Box>

            <Paper sx={tableStyles.paper}>
                <TableContainer>
                    <DataTable
                        columns={columns}
                        data={cars}
                        onEdit={handleOpenDialog}
                        onDelete={handleDelete}
                        pagination={{
                            page: pagination.page,
                            limit: pagination.limit,
                            total: pagination.total,
                            onPageChange: handlePageChange,
                            onLimitChange: handleLimitChange
                        }}
                    />
                </TableContainer>
            </Paper>

            <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="md" fullWidth>
                <DialogTitle>
                    {selectedCar ? 'Cập nhật xe' : 'Thêm mới xe'}
                </DialogTitle>
                <DialogContent>
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 2 }}>
                        <TextField
                            label="Loại xe"
                            name="carType"
                            value={formData.carType}
                            onChange={handleInputChange}
                            fullWidth
                        />
                        <TextField
                            label="Biển số xe"
                            name="bks"
                            value={formData.bks}
                            onChange={handleInputChange}
                            fullWidth
                        />
                        <FormControl fullWidth>
                            <InputLabel>Team</InputLabel>
                            <Select
                                name="team"
                                value={formData.team}
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
                        <TextField
                            label="Năm sản xuất"
                            name="yearOfManufacture"
                            type="date"
                            value={formData.yearOfManufacture}
                            onChange={handleInputChange}
                            fullWidth
                            InputLabelProps={{ shrink: true }}
                        />
                        <TextField
                            label="Hạn đăng kiểm"
                            name="registrationPeriod"
                            type="date"
                            value={formData.registrationPeriod}
                            onChange={handleInputChange}
                            fullWidth
                            InputLabelProps={{ shrink: true }}
                        />
                        <TextField
                            label="Tên đăng kiểm"
                            name="registrationName"
                            value={formData.registrationName}
                            onChange={handleInputChange}
                            fullWidth
                        />
                        <TextField
                            label="Định giá"
                            name="valuation"
                            type="number"
                            value={formData.valuation}
                            onChange={handleInputChange}
                            fullWidth
                        />
                        <TextField
                            label="Hạn bảo hiểm TNDS"
                            name="insurancePeriodTNDS"
                            type="date"
                            value={formData.insurancePeriodTNDS}
                            onChange={handleInputChange}
                            fullWidth
                            InputLabelProps={{ shrink: true }}
                        />
                        <TextField
                            label="Đơn vị bán TNDS"
                            name="insuranceSellerTNDS"
                            value={formData.insuranceSellerTNDS}
                            onChange={handleInputChange}
                            fullWidth
                        />
                        <TextField
                            label="Hạn bảo hiểm BHVC"
                            name="insurancePeriodBHVC"
                            type="date"
                            value={formData.insurancePeriodBHVC}
                            onChange={handleInputChange}
                            fullWidth
                            InputLabelProps={{ shrink: true }}
                        />
                        <TextField
                            label="Đơn vị bán BHVC"
                            name="insuranceSellerBHVC"
                            value={formData.insuranceSellerBHVC}
                            onChange={handleInputChange}
                            fullWidth
                        />
                        <TextField
                            label="Hạn GPS"
                            name="insurancePeriodGPS"
                            type="date"
                            value={formData.insurancePeriodGPS}
                            onChange={handleInputChange}
                            fullWidth
                            InputLabelProps={{ shrink: true }}
                        />
                        <TextField
                            label="Mô tả GPS"
                            name="descriptionGPS"
                            value={formData.descriptionGPS}
                            onChange={handleInputChange}
                            fullWidth
                            multiline
                            rows={2}
                        />
                        <TextField
                            label="Hạn 4G"
                            name="insurancePeriod4G"
                            type="date"
                            value={formData.insurancePeriod4G}
                            onChange={handleInputChange}
                            fullWidth
                            InputLabelProps={{ shrink: true }}
                        />
                        <TextField
                            label="Đơn vị cung cấp 4G"
                            name="insuranceSeller4G"
                            value={formData.insuranceSeller4G}
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
                            rows={3}
                        />
                    </Box>
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleCloseDialog}>Hủy</Button>
                    <Button onClick={handleSubmit} variant="contained">
                        {selectedCar ? 'Cập nhật' : 'Thêm mới'}
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

export default CarManagement; 