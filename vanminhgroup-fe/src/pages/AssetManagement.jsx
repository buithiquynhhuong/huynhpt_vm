import React, { useState, useEffect, useCallback } from 'react';
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
    TableContainer,
    Tooltip,
    Grid,
    FormHelperText,
    ListSubheader
} from '@mui/material';
import {
    Add as AddIcon,
    ImportExport as ImportExportIcon
} from '@mui/icons-material';
import DataTable from '../components/DataTable';
import axios from 'axios';
import assetTransferApi from '../api/assetTransferApi';
import officeApi from '../api/officeApi';
import axiosClient from '../api/axiosClient';
import { jwtDecode } from 'jwt-decode';
import { tableStyles } from '../styles/TableStyles';

const AssetManagement = () => {
    const [assets, setAssets] = useState([]);
    const [units, setUnits] = useState([]);
    const [assetTypes, setAssetTypes] = useState([]);
    const [offices, setOffices] = useState([]);
    const [departments, setDepartments] = useState([]);
    const [openDialog, setOpenDialog] = useState(false);
    const [selectedAsset, setSelectedAsset] = useState(null);
    const [snackbar, setSnackbar] = useState({
        open: false,
        message: '',
        severity: 'success'
    });
    const [formData, setFormData] = useState({
        code: '',
        quantity: '',
        unit: '',
        name: '',
        modelOrSeries: '',
        assetType: '',
        dateOfPurchase: '',
        warranty: '',
        expirationDate: '',
        price: '',
        depreciation: '',
        supplier: '',
        addressNCC: '',
        phoneNCC: '',
        assetLocation: '',
        managementOffice: '',
        description: '',
        seeMore: {},
    });
    const [pagination, setPagination] = useState({
        page: 1,
        limit: 10,
        total: 0,
    });
    const [transferDialog, setTransferDialog] = useState(false);
    const [transferType, setTransferType] = useState('IMPORT');
    const [transferData, setTransferData] = useState({
        assetId: '',
        quantity: 0,
        fromOfficeId: '',
        toOfficeId: '',
        note: '',
        reason: 'NEW_IMPORT'
    });
    const [fromOffice, setFromOffice] = useState(null);
    const [assetInventory, setAssetInventory] = useState(null);

    useEffect(() => {
        fetchAssets();
        fetchUnits();
        fetchAssetTypes();
        fetchOffices();
        fetchDepartments();
    }, []);

    useEffect(() => {
        const fetchOfficeData = async () => {
            try {
                if (transferData.assetId) {
                    const selectedAsset = assets.find(asset => asset._id === transferData.assetId);
                    if (selectedAsset?.managementOffice) {
                        const response = await axios.get(
                            `http://localhost:3076/api/vanminh/office/${selectedAsset.managementOffice}`, 
                            getAuthConfig()
                        );
                        console.log('Office Data:', response.data);
                        setFromOffice(response.data);
                    }
                }
            } catch (error) {
                console.error('Error fetching office:', error);
            }
        };

        fetchOfficeData();
    }, [transferData.assetId, assets]);

    useEffect(() => {
        const fetchInventory = async () => {
            if (transferData.assetId && transferType === 'EXPORT') {
                try {
                    const response = await axios.get(
                        `http://localhost:3076/api/vanminh/asset-transfer/inventory/${transferData.assetId}`,
                        getAuthConfig()
                    );
                    console.log('Inventory Data:', response.data);
                    setAssetInventory(response.data);
                } catch (error) {
                    console.error('Error fetching inventory:', error);
                }
            }
        };
        fetchInventory();
    }, [transferData.assetId, transferType]);

    const getAuthConfig = () => {
        const token = localStorage.getItem('token');
        return {
            headers: {
                'Authorization': token
            }
        };
    };

    const getUserIdFromToken = () => {
        const token = localStorage.getItem('token');
        if (!token) {
            console.warn('No token found in localStorage');
            return null;
        }
        
        try {
            const decoded = jwtDecode(token);
            console.log('Decoded token:', decoded);
            
            const userId = decoded.id || decoded._id;
            console.log('Extracted userId:', userId);
            
            if (!userId) {
                console.warn('No id found in decoded token');
                return null;
            }
            
            return userId;
        } catch (error) {
            console.error('Error decoding token:', error);
            return null;
        }
    };

    const fetchAssets = async () => {
        try {
            console.log('Fetching assets with pagination:', {
                page: pagination.page,
                limit: pagination.limit
            });
            
            const response = await axios.get('http://localhost:3076/api/vanminh/asset', {
                params: {
                    page: pagination.page,
                    limit: pagination.limit
                },
                headers: {
                    'Authorization': localStorage.getItem('token')
                }
            });
            
            console.log('Asset Response:', response.data);
            
            if (response.data) {
                setAssets(response.data.data || []);
                setPagination(prev => ({
                    ...prev,
                    total: response.data.total || 0
                }));
                console.log('Updated pagination:', {
                    page: pagination.page,
                    limit: pagination.limit,
                    total: response.data.total
                });
            }
        } catch (error) {
            console.error('Lỗi khi lấy dữ liệu tài sản:', error);
            showSnackbar('Lỗi khi lấy dữ liệu tài sản', 'error');
        }
    };

    const fetchUnits = async () => {
        try {
            const response = await axios.get('http://localhost:3076/api/vanminh/unit', {
                headers: {
                    'Authorization': localStorage.getItem('token')
                }
            });
            setUnits(response.data || []);
        } catch (error) {
            console.error('Lỗi khi lấy dữ liệu đơn vị:', error);
        }
    };

    const fetchAssetTypes = async () => {
        try {
            const response = await axios.get('http://localhost:3076/api/vanminh/asset-type', {
                headers: {
                    'Authorization': localStorage.getItem('token')
                }
            });
            setAssetTypes(response.data || []);
        } catch (error) {
            console.error('Lỗi khi lấy dữ liệu loại tài sản:', error);
        }
    };

    const fetchOffices = async () => {
        try {
            const response = await axios.get('http://localhost:3076/api/vanminh/office', {
                headers: {
                    'Authorization': localStorage.getItem('token')
                }
            });
            setOffices(response.data || []);
        } catch (error) {
            console.error('Lỗi khi lấy dữ liệu văn phòng:', error);
        }
    };

    const fetchDepartments = async () => {
        try {
            const response = await axios.get('http://localhost:3076/api/vanminh/departmant', {
                headers: {
                    'Authorization': localStorage.getItem('token')
                }
            });
            setDepartments(response.data || []);
        } catch (error) {
            console.error('Lỗi khi lấy dữ liệu phòng ban:', error);
        }
    };

    const handleOpenDialog = (asset = null) => {
        if (asset) {
            setSelectedAsset(asset);
            setFormData({
                code: asset.code || '',
                quantity: asset.quantity || '',
                unit: asset.unit || '',
                name: asset.name || '',
                modelOrSeries: asset.modelOrSeries || '',
                assetType: asset.assetType || '',
                dateOfPurchase: asset.dateOfPurchase ? asset.dateOfPurchase.split('T')[0] : '',
                warranty: asset.warranty || '',
                expirationDate: asset.expirationDate ? asset.expirationDate.split('T')[0] : '',
                price: asset.price || '',
                depreciation: asset.depreciation || '',
                supplier: asset.supplier || '',
                addressNCC: asset.addressNCC || '',
                phoneNCC: asset.phoneNCC || '',
                assetLocation: asset.assetLocation || '',
                managementOffice: asset.managementOffice || '',
                description: asset.description || '',
                seeMore: asset.seeMore || {},
            });
        } else {
            setSelectedAsset(null);
            setFormData({
                code: '',
                quantity: '',
                unit: '',
                name: '',
                modelOrSeries: '',
                assetType: '',
                dateOfPurchase: '',
                warranty: '',
                expirationDate: '',
                price: '',
                depreciation: '',
                supplier: '',
                addressNCC: '',
                phoneNCC: '',
                assetLocation: '',
                managementOffice: '',
                description: '',
                seeMore: {},
            });
        }
        setOpenDialog(true);
    };

    const handleCloseDialog = () => {
        setOpenDialog(false);
        setSelectedAsset(null);
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
            if (selectedAsset) {
                await axios.put(`http://localhost:3076/api/vanminh/asset/${selectedAsset._id}`, formData, getAuthConfig());
                showSnackbar('Cập nhật tài sản thành công');
            } else {
                await axios.post('http://localhost:3076/api/vanminh/asset', formData, getAuthConfig());
                showSnackbar('Thêm tài sản thành công');
            }
            handleCloseDialog();
            fetchAssets();
        } catch (error) {
            showSnackbar('Có lỗi xảy ra', 'error');
        }
    };

    const handleDelete = async (id) => {
        try {
            await axios.delete(`http://localhost:3076/api/vanminh/asset/${id}`, getAuthConfig());
            showSnackbar('Xóa tài sản thành công');
            fetchAssets();
        } catch (error) {
            showSnackbar('Lỗi khi xóa tài sản', 'error');
        }
    };

    const handleCloseSnackbar = () => {
        setSnackbar(prev => ({ ...prev, open: false }));
    };

    const showSnackbar = (message, severity = 'success') => {
        setSnackbar({ open: true, message, severity });
    };

    const formatDate = (dateString) => {
        if (!dateString) return '';
        return new Date(dateString).toLocaleDateString();
    };

    const formatCurrency = (value) => {
        if (!value) return '';
        return value.toLocaleString('vi-VN') + ' VNĐ';
    };

    const formatPrice = (price) => {
        return new Intl.NumberFormat('vi-VN', { 
            style: 'currency', 
            currency: 'VND' 
        }).format(price);
    };

    const columns = [
        {
            field: 'code',
            headerName: 'Mã tài sản',
            width: 150,
            renderCell: (row) => (
                <Tooltip title={row?.code || 'Không có thông tin'}>
                    <Box sx={tableStyles.cellContent}>
                        {row?.code || 'Không có thông tin'}
                    </Box>
                </Tooltip>
            )
        },
        {
            field: 'name',
            headerName: 'Tên tài sản',
            width: 200,
            renderCell: (row) => (
                <Tooltip title={row?.name || 'Không có thông tin'}>
                    <Box sx={tableStyles.cellContent}>
                        {row?.name || 'Không có thông tin'}
                    </Box>
                </Tooltip>
            )
        },
        {
            field: 'unit',
            headerName: 'Đơn vị tính',
            width: 150,
            renderCell: (row) => {
                const unitLabel = typeof row?.unit === 'object' ? row?.unit?.label : row?.unit;
                return (
                    <Tooltip title={unitLabel || 'Không có thông tin'}>
                        <Box sx={tableStyles.cellContent}>
                            {unitLabel || 'Không có thông tin'}
                        </Box>
                    </Tooltip>
                );
            }
        },
        {
            field: 'assetType',
            headerName: 'Loại tài sản',
            width: 150,
            renderCell: (row) => {
                const typeLabel = typeof row?.assetType === 'object' ? row?.assetType?.label : row?.assetType;
                return (
                    <Tooltip title={typeLabel || 'Không có thông tin'}>
                        <Box sx={tableStyles.cellContent}>
                            {typeLabel || 'Không có thông tin'}
                        </Box>
                    </Tooltip>
                );
            }
        },
        {
            field: 'assetLocation',
            headerName: 'Vị trí',
            width: 150,
            renderCell: (row) => {
                const locationLabel = typeof row?.assetLocation === 'object' ? row?.assetLocation?.label : row?.assetLocation;
                return (
                    <Tooltip title={locationLabel || 'Không có thông tin'}>
                        <Box sx={tableStyles.cellContent}>
                            {locationLabel || 'Không có thông tin'}
                        </Box>
                    </Tooltip>
                );
            }
        },
        {
            field: 'managementOffice',
            headerName: 'Văn phòng quản lý',
            width: 200,
            renderCell: (row) => {
                const officeLabel = typeof row?.managementOffice === 'object' ? row?.managementOffice?.label : row?.managementOffice;
                return (
                    <Tooltip title={officeLabel || 'Không có thông tin'}>
                        <Box sx={tableStyles.cellContent}>
                            {officeLabel || 'Không có thông tin'}
                        </Box>
                    </Tooltip>
                );
            }
        },
        {
            field: 'quantity',
            headerName: 'Số lượng',
            width: 100,
            renderCell: (row) => (
                <Tooltip title={row?.quantity?.toString() || '0'}>
                    <Box sx={tableStyles.cellContent}>
                        {row?.quantity || '0'}
                    </Box>
                </Tooltip>
            )
        },
        {
            field: 'price',
            headerName: 'Giá',
            width: 150,
            renderCell: (row) => (
                <Tooltip title={formatPrice(row?.price) || 'Không có thông tin'}>
                    <Box sx={tableStyles.cellContent}>
                        {formatPrice(row?.price) || 'Không có thông tin'}
                    </Box>
                </Tooltip>
            )
        },
        {
            field: 'actions',
            headerName: 'Thao tác',
            width: 300,
            renderCell: (row) => (
                <Box>
                    <Button
                        variant="contained"
                        color="primary"
                        size="small"
                        onClick={() => handleOpenDialog(row)}
                        sx={{ mr: 1 }}
                    >
                        Chi tiết
                    </Button>
                    <Button
                        variant="contained"
                        color="success"
                        size="small"
                        onClick={() => handleImportAsset(row)}
                        sx={{ mr: 1 }}
                    >
                        Nhập kho
                    </Button>
                    <Button
                        variant="contained"
                        color="secondary"
                        size="small"
                        onClick={() => handleTransferDialogOpen(row, 'EXPORT')}
                    >
                        Xuất kho
                    </Button>
                </Box>
            )
        }
    ];

    const handleTransferDialogOpen = (asset, type) => {
        console.log('Opening dialog with asset:', asset);
        setTransferType(type);
        
        // Đảm bảo lấy đúng managementOffice._id từ asset
        const managementOfficeId = asset?.managementOffice?._id || asset?.managementOffice;
        
        setTransferData({
            assetId: asset?._id,
            fromOfficeId: managementOfficeId,
            toOfficeId: '',
            quantity: 1,
            note: '',
            reason: type === 'IMPORT' ? 'NEW_IMPORT' : 'TRANSFER'
        });
        setTransferDialog(true);
    };

    const handleTransferDialogClose = () => {
        setTransferDialog(false);
        setTransferData({
            assetId: '',
            quantity: 0,
            fromOfficeId: '',
            toOfficeId: '',
            note: '',
            reason: 'NEW_IMPORT'
        });
    };

    const handleTransferChange = (event) => {
        const { name, value } = event.target;
        setTransferData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    // Hàm chuẩn bị dữ liệu sourceAsset
    const prepareSourceAssetData = (asset) => {
        return {
            code: asset.code || '',
            name: asset.name || '',
            modelOrSeries: asset.modelOrSeries || '',
            assetType: asset.assetType?._id || '',
            unit: asset.unit?._id || '',
            dateOfPurchase: asset.dateOfPurchase || null,
            warranty: asset.warranty || 0,
            expirationDate: asset.expirationDate || null,
            price: asset.price || 0,
            depreciation: asset.depreciation || '',
            supplier: asset.supplier || '',
            addressNCC: asset.addressNCC || '',
            phoneNCC: asset.phoneNCC || '',
            assetLocation: asset.assetLocation?._id || '',
            description: asset.description || '',
            seeMore: asset.seeMore || {}
        };
    };

    const handleTransferSubmit = async () => {
        try {
            if (!transferData.assetId || !transferData.toOfficeId || transferData.quantity <= 0) {
                showSnackbar('Vui lòng điền đầy đủ thông tin', 'error');
                return;
            }

            // Lấy userId từ token
            const userId = getUserIdFromToken();
            if (!userId) {
                showSnackbar('Không tìm thấy thông tin người dùng', 'error');
                return;
            }

            // Chỉ kiểm tra số lượng khi xuất kho
            if (transferType === 'EXPORT') {
                const asset = assets.find(a => a._id === transferData.assetId);
                if (!asset) {
                    showSnackbar('Không tìm thấy thông tin tài sản', 'error');
                    return;
                }

                if (asset.quantity < transferData.quantity) {
                    showSnackbar('Số lượng tài sản không đủ trong kho', 'error');
                    return;
                }

                // Kiểm tra văn phòng đích
                if (!transferData.toOfficeId) {
                    showSnackbar('Vui lòng chọn văn phòng đích', 'error');
                    return;
                }

                // Log dữ liệu trước khi gửi
                console.log('Asset gốc:', asset);

                // Chuẩn bị dữ liệu sourceAsset
                const sourceAssetData = prepareSourceAssetData(asset);
                console.log('Source Asset Data:', sourceAssetData);

                // Thêm thông tin tài sản gốc vào request data
                const requestData = {
                    assetId: transferData.assetId,
                    fromOfficeId: transferData.fromOfficeId,
                    toOfficeId: transferData.toOfficeId,
                    quantity: transferData.quantity,
                    note: transferData.note || '',
                    reason: transferData.reason || 'TRANSFER',
                    userId: userId,
                    sourceAsset: sourceAssetData
                };

                console.log('Request Data cuối cùng:', requestData);

                const response = await axios.post(
                    `http://localhost:3076/api/vanminh/asset-transfer/export`,
                    requestData,
                    getAuthConfig()
                );

                showSnackbar(response.data?.message || 'Thao tác thành công');
                handleTransferDialogClose();
                fetchAssets();
            } else {
                // Xử lý nhập kho
                const requestData = {
                    ...transferData,
                    userId: userId
                };

                console.log('Dữ liệu gửi đi khi nhập kho:', requestData);

                const response = await axios.post(
                    `http://localhost:3076/api/vanminh/asset-transfer/import`,
                    requestData,
                    getAuthConfig()
                );

                showSnackbar(response.data?.message || 'Thao tác thành công');
                handleTransferDialogClose();
                fetchAssets();
            }
        } catch (error) {
            console.error('Lỗi khi thực hiện điều chuyển:', error);
            showSnackbar(error.response?.data?.message || 'Có lỗi xảy ra', 'error');
        }
    };

    const handleImportAsset = async (asset) => {
        try {
            const userId = getUserIdFromToken();
            if (!userId) {
                showSnackbar('Không tìm thấy thông tin người dùng', 'error');
                return;
            }

            setTransferType('IMPORT');
            setTransferData({
                assetId: asset?._id,
                quantity: 1,
                fromOfficeId: asset?.managementOffice?._id || '',
                toOfficeId: asset?.managementOffice?._id || '',
                note: '',
                reason: 'NEW_IMPORT',
                userId: userId
            });
            setTransferDialog(true);
        } catch (error) {
            console.error('Error in import asset:', error);
            showSnackbar(error.response?.data?.message || 'Có lỗi xảy ra khi nhập kho', 'error');
        }
    };

    const renderTransferDialog = () => {
        const selectedAssetData = assets.find(asset => asset?._id === transferData?.assetId);
    
        const managementOfficeInfo = selectedAssetData?.managementOffice;
        const sourceQuantity = selectedAssetData?.quantity || 0;

        return (
            <Dialog open={transferDialog} onClose={handleTransferDialogClose} maxWidth="sm" fullWidth>
                <DialogTitle>
                    {transferType === 'IMPORT' ? 'Nhập kho' : 'Xuất kho'}
                </DialogTitle>
                <DialogContent>
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 2 }}>
                        <FormControl fullWidth>
                            <InputLabel>Tài sản</InputLabel>
                            <Select
                                value={transferData?.assetId || ''}
                                label="Tài sản"
                                disabled={true}
                            >
                                {selectedAssetData && (
                                    <MenuItem value={selectedAssetData?._id}>
                                        {selectedAssetData?.name} ({selectedAssetData?.code})
                                    </MenuItem>
                                )}
                            </Select>
                        </FormControl>

                        {transferType === 'EXPORT' && (
                            <>
                                <FormControl fullWidth>
                                    <InputLabel>Văn phòng nguồn</InputLabel>
                                    <Select
                                        value={transferData?.fromOfficeId || ''}
                                        label="Văn phòng nguồn"
                                        disabled={true}
                                    >
                                        <MenuItem value={managementOfficeInfo?._id || ''}>
                                            {managementOfficeInfo?.label || 'Không có thông tin'}
                                        </MenuItem>
                                    </Select>
                                    <FormHelperText>
                                        Số lượng hiện có: {sourceQuantity}
                                    </FormHelperText>
                                </FormControl>

                                <FormControl fullWidth>
                                    <InputLabel>Văn phòng đích</InputLabel>
                                    <Select
                                        name="toOfficeId"
                                        value={transferData?.toOfficeId || ''}
                                        onChange={handleTransferChange}
                                        label="Văn phòng đích"
                                    >
                                        {offices.filter(office => office?._id !== managementOfficeInfo?._id).map(office => (
                                            <MenuItem key={office?._id} value={office?._id}>
                                                {office?.label}
                                            </MenuItem>
                                        ))}
                                    </Select>
                                </FormControl>
                            </>
                        )}

                        <TextField
                            label="Số lượng"
                            name="quantity"
                            type="number"
                            value={transferData?.quantity || ''}
                            onChange={handleTransferChange}
                            fullWidth
                            inputProps={{ min: 1, max: sourceQuantity }}
                        />

                        <TextField
                            label="Ghi chú"
                            name="note"
                            value={transferData?.note || ''}
                            onChange={handleTransferChange}
                            fullWidth
                            multiline
                            rows={3}
                        />
                    </Box>
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleTransferDialogClose}>Hủy</Button>
                    <Button
                        onClick={handleTransferSubmit}
                        variant="contained"
                        disabled={
                            transferData?.quantity <= 0 || 
                            (transferType === 'EXPORT' && (
                                !transferData?.toOfficeId || 
                                transferData?.quantity > sourceQuantity ||
                                transferData?.toOfficeId === managementOfficeInfo?._id
                            ))
                        }
                    >
                        {transferType === 'IMPORT' ? 'Nhập kho' : 'Xuất kho'}
                    </Button>
                </DialogActions>
            </Dialog>
        );
    };

    // Thêm hàm mới để xử lý nút xuất/nhập kho trên toolbar
    const handleToolbarTransfer = (type) => {
        showSnackbar('Vui lòng sử dụng nút xuất/nhập kho trong danh sách tài sản', 'warning');
    };

    const handlePageChange = (newPage) => {
        console.log('Changing page to:', newPage);
        setPagination(prev => ({
            ...prev,
            page: newPage + 1 // Chuyển từ index 0 sang index 1
        }));
    };

    const handleLimitChange = (newLimit) => {
        console.log('Changing limit to:', newLimit);
        setPagination(prev => ({
            ...prev,
            limit: newLimit,
            page: 1 // Reset về trang 1 khi thay đổi limit
        }));
    };

    // Thêm useEffect để theo dõi thay đổi pagination
    useEffect(() => {
        console.log('Pagination changed, fetching new data:', pagination);
        fetchAssets();
    }, [pagination.page, pagination.limit]);

    return (
        <Box sx={{ p: 3 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
                <Typography variant="h4">Quản lý tài sản</Typography>
                <Box>
                    <Button
                        variant="contained"
                        startIcon={<AddIcon />}
                        onClick={() => handleOpenDialog()}
                        sx={{ ml: 1 }}
                    >
                        Thêm mới
                    </Button>
                </Box>
            </Box>

            {/* Thêm ô tìm kiếm */}
            <Box sx={{ mb: 3 }}>
                <Grid container spacing={2} alignItems="center">
                    <Grid item xs={12} sm={4}>
                        <TextField
                            fullWidth
                            label="Tìm kiếm theo mã tài sản"
                            variant="outlined"
                            size="small"
                            onChange={(e) => {
                                const searchCode = e.target.value;
                                // Reset về trang 1 khi tìm kiếm
                                setPagination(prev => ({
                                    ...prev,
                                    page: 1
                                }));
                                // Gọi API với mã tài sản
                                axios.get('http://localhost:3076/api/vanminh/asset', {
                                    params: {
                                        page: 1,
                                        limit: pagination.limit,
                                        code: searchCode
                                    },
                                    headers: {
                                        'Authorization': localStorage.getItem('token')
                                    }
                                })
                                .then(response => {
                                    if (response.data && response.data.data) {
                                        setAssets(response.data.data);
                                        setPagination(prev => ({
                                            ...prev,
                                            total: response.data.total || 0
                                        }));
                                    }
                                })
                                .catch(error => {
                                    console.error('Lỗi khi tìm kiếm tài sản:', error);
                                    showSnackbar('Lỗi khi tìm kiếm tài sản', 'error');
                                });
                            }}
                            placeholder="Nhập mã tài sản..."
                            InputProps={{
                                sx: { 
                                    backgroundColor: 'white',
                                    '&:hover': { backgroundColor: 'white' }
                                }
                            }}
                        />
                    </Grid>
                </Grid>
            </Box>

            <Paper 
                sx={{ 
                    mb: 2, 
                    overflow: 'hidden',
                    borderRadius: 2,
                    boxShadow: 3,
                    '& .MuiTableRow-root:hover': {
                        backgroundColor: 'rgba(0, 0, 0, 0.04)'
                    },
                    '& .MuiTableCell-head': {
                        backgroundColor: '#FFA726',
                        color: '#fff',
                        fontWeight: 'bold',
                        fontSize: '0.9rem',
                        padding: '12px 16px',
                        textTransform: 'uppercase',
                        letterSpacing: '0.5px',
                        borderBottom: 'none',
                        whiteSpace: 'nowrap'
                    },
                    '& .MuiTableCell-root': {
                        borderBottom: '1px solid rgba(224, 224, 224, 1)',
                        padding: '8px 16px',
                        fontSize: '0.875rem'
                    }
                }}
            >
                <TableContainer>
                    <DataTable
                        columns={columns}
                        data={assets}
                        onEdit={handleOpenDialog}
                        onDelete={handleDelete}
                        rowsPerPage={pagination.limit}
                        page={pagination.page - 1}
                        onPageChange={(newPage) => handlePageChange(newPage + 1)}
                        onRowsPerPageChange={handleLimitChange}
                        rowsPerPageOptions={[5, 10, 25, 50]}
                        count={pagination.total}
                        totalPages={Math.ceil(pagination.total / pagination.limit)}
                    />
                </TableContainer>
            </Paper>

            <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="md" fullWidth>
                <DialogTitle>
                    {selectedAsset ? 'Cập nhật tài sản' : 'Thêm mới tài sản'}
                </DialogTitle>
                <DialogContent>
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 2 }}>
                        <TextField
                            label="Mã tài sản"
                            name="code"
                            value={formData.code}
                            onChange={handleInputChange}
                            fullWidth
                        />
                        <TextField
                            label="Tên tài sản"
                            name="name"
                            value={formData.name}
                            onChange={handleInputChange}
                            fullWidth
                        />
                        <TextField
                            label="Model/Series"
                            name="modelOrSeries"
                            value={formData.modelOrSeries}
                            onChange={handleInputChange}
                            fullWidth
                        />
                        <FormControl fullWidth>
                            <InputLabel>Loại tài sản</InputLabel>
                            <Select
                                name="assetType"
                                value={formData.assetType}
                                onChange={handleInputChange}
                                label="Loại tài sản"
                            >
                                {assetTypes.map((type) => (
                                    <MenuItem key={type?._id} value={type?._id}>
                                        {type?.label}
                                    </MenuItem>
                                ))}
                            </Select>
                        </FormControl>
                        <Box sx={{ display: 'flex', gap: 2 }}>
                            <TextField
                                label="Số lượng"
                                name="quantity"
                                type="number"
                                value={formData.quantity}
                                onChange={handleInputChange}
                                fullWidth
                            />
                            <FormControl fullWidth>
                                <InputLabel>Đơn vị</InputLabel>
                                <Select
                                    name="unit"
                                    value={formData.unit}
                                    onChange={handleInputChange}
                                    label="Đơn vị"
                                >
                                    {units.map((unit) => (
                                        <MenuItem key={unit?._id} value={unit?._id}>
                                            {unit?.label}
                                        </MenuItem>
                                    ))}
                                </Select>
                            </FormControl>
                        </Box>
                        <TextField
                            label="Giá"
                            name="price"
                            type="number"
                            value={formData.price}
                            onChange={handleInputChange}
                            fullWidth
                        />
                        <TextField
                            label="Ngày mua"
                            name="dateOfPurchase"
                            type="date"
                            value={formData.dateOfPurchase}
                            onChange={handleInputChange}
                            fullWidth
                            InputLabelProps={{ shrink: true }}
                        />
                        <TextField
                            label="Thời hạn bảo hành (tháng)"
                            name="warranty"
                            type="number"
                            value={formData.warranty}
                            onChange={handleInputChange}
                            fullWidth
                        />
                        <TextField
                            label="Ngày hết hạn"
                            name="expirationDate"
                            type="date"
                            value={formData.expirationDate}
                            onChange={handleInputChange}
                            fullWidth
                            InputLabelProps={{ shrink: true }}
                        />
                        <TextField
                            label="Khấu hao"
                            name="depreciation"
                            value={formData.depreciation}
                            onChange={handleInputChange}
                            fullWidth
                        />
                        <TextField
                            label="Nhà cung cấp"
                            name="supplier"
                            value={formData.supplier}
                            onChange={handleInputChange}
                            fullWidth
                        />
                        <TextField
                            label="Địa chỉ nhà cung cấp"
                            name="addressNCC"
                            value={formData.addressNCC}
                            onChange={handleInputChange}
                            fullWidth
                        />
                        <TextField
                            label="Số điện thoại nhà cung cấp"
                            name="phoneNCC"
                            value={formData.phoneNCC}
                            onChange={handleInputChange}
                            fullWidth
                        />
                        <FormControl fullWidth>
                            <InputLabel>Vị trí tài sản</InputLabel>
                            <Select
                                name="assetLocation"
                                value={formData.assetLocation}
                                onChange={handleInputChange}
                                label="Vị trí tài sản"
                            >
                                {offices.map((office) => (
                                    <MenuItem key={office?._id} value={office?._id}>
                                        {office?.label}
                                    </MenuItem>
                                ))}
                            </Select>
                        </FormControl>
                        <FormControl fullWidth>
                            <InputLabel>Văn phòng quản lý</InputLabel>
                            <Select
                                name="managementOffice"
                                value={formData.managementOffice}
                                onChange={handleInputChange}
                                label="Văn phòng quản lý"
                            >
                                {offices.map((office) => (
                                    <MenuItem key={office?._id} value={office?._id}>
                                        {office?.label}
                                    </MenuItem>
                                ))}
                            </Select>
                        </FormControl>
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
                        {selectedAsset ? 'Cập nhật' : 'Thêm mới'}
                    </Button>
                </DialogActions>
            </Dialog>

            {renderTransferDialog()}

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

export default AssetManagement; 