import React, { useState, useEffect } from 'react';
import {
    Box,
    Typography,
    Paper,
    Button,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Checkbox,
    IconButton,
    Tooltip,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    TablePagination,
    CircularProgress,
    Snackbar,
    Alert,
    Chip,
    Grid,
    TextField,
    MenuItem,
    FormControl,
    InputLabel,
    Select,
    styled
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import FilterListIcon from '@mui/icons-material/FilterList';
import axios from 'axios';
import { tableStyles } from '../styles/TableStyles';

const StyledTableCell = styled(TableCell)(({ theme }) => ({
    padding: theme.spacing(2),
    '&.MuiTableCell-head': {
        backgroundColor: theme.palette.primary.dark,
        color: theme.palette.common.white,
        fontWeight: 'bold',
        fontSize: '0.95rem',
    },
    '&.MuiTableCell-body': {
        fontSize: '0.875rem',
        color: theme.palette.text.primary,
    },
}));

const StyledTableRow = styled(TableRow)(({ theme }) => ({
    '&:nth-of-type(odd)': {
        backgroundColor: theme.palette.grey[50],
    },
    '&:last-child td, &:last-child th': {
        border: 0,
    },
    '&:hover': {
        backgroundColor: theme.palette.primary.light + '10',
    },
}));

const StatusChip = styled(Chip)(({ theme, status }) => ({
    backgroundColor: 
        status === 'Chờ xử lý' ? theme.palette.warning.light + '30' :
        status === 'Hoàn thành' ? theme.palette.success.light + '30' :
        status === 'Đã hủy' ? theme.palette.error.light + '30' :
        theme.palette.grey[100],
    color: 
        status === 'Chờ xử lý' ? theme.palette.warning.dark :
        status === 'Hoàn thành' ? theme.palette.success.dark :
        status === 'Đã hủy' ? theme.palette.error.dark :
        theme.palette.grey[700],
    fontWeight: 500,
}));

const TransferTypeChip = styled(Chip)(({ theme, type }) => ({
    backgroundColor: 
        type === 'Nhập kho' ? theme.palette.success.light + '30' :
        type === 'Xuất kho' ? theme.palette.error.light + '30' :
        theme.palette.grey[100],
    color: 
        type === 'Nhập kho' ? theme.palette.success.dark :
        type === 'Xuất kho' ? theme.palette.error.dark :
        theme.palette.grey[700],
    fontWeight: 600,
    fontSize: '0.9rem',
    padding: '4px 8px',
    '& .MuiChip-label': {
        padding: '0 8px'
    }
}));

const AssetTransferHistory = () => {
    const [logs, setLogs] = useState([]);
    const [loading, setLoading] = useState(false);
    const [selectedLogs, setSelectedLogs] = useState([]);
    const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
    const [pagination, setPagination] = useState({
        page: 0,
        limit: 10,
        total: 0
    });
    const [filters, setFilters] = useState({
        transferType: '',
        status: '',
        fromDate: '',
        toDate: ''
    });
    const [snackbar, setSnackbar] = useState({
        open: false,
        message: '',
        severity: 'success'
    });

    const showSnackbar = (message, severity = 'success') => {
        setSnackbar({
            open: true,
            message,
            severity
        });
    };

    const handleCloseSnackbar = () => {
        setSnackbar(prev => ({ ...prev, open: false }));
    };

    const getAuthConfig = () => {
        const token = localStorage.getItem('token');
        if (!token) {
            console.warn('Không tìm thấy token trong localStorage');
            return {};
        }
        return {
            headers: {
                'Authorization': token
            }
        };
    };

    const fetchLogs = async () => {
        try {
            setLoading(true);
            const token = localStorage.getItem('token');
            if (!token) {
                showSnackbar('Vui lòng đăng nhập lại', 'error');
                return;
            }

            // Xây dựng query params
            const queryParams = new URLSearchParams();
            
            // Thêm phân trang
            queryParams.append('page', pagination.page + 1);
            queryParams.append('limit', pagination.limit);
            
            // Thêm các bộ lọc
            if (filters.transferType) {
                queryParams.append('transferType', filters.transferType);
            }
            if (filters.status) {
                queryParams.append('status', filters.status);
            }
            if (filters.fromDate) {
                queryParams.append('fromDate', new Date(filters.fromDate).toISOString());
            }
            if (filters.toDate) {
                queryParams.append('toDate', new Date(filters.toDate).toISOString());
            }

            console.log('Query params:', queryParams.toString());

            const response = await axios.get(
                `http://localhost:3076/api/vanminh/asset-transfer/logs?${queryParams.toString()}`,
                getAuthConfig()
            );
            
            console.log('API Response:', response.data);
            
            const logs = response.data?.logs || [];
            
            const formattedLogs = logs.map(log => ({
                ...log,
                assetName: log.assetId?.name || 'Không có tên',
                assetCode: log.assetId?.code || 'Không có mã',
                fromOffice: log.fromOffice?.label || 'Không có thông tin',
                toOffice: log.toOffice?.label || 'Không có thông tin',
                transferBy: log.transferBy?.name || 'Không có thông tin',
                transferType: log.transferType === 'IMPORT' ? 'Nhập kho' : 'Xuất kho',
                status: log.status === 'PENDING' ? 'Chờ xử lý' : 
                       log.status === 'COMPLETED' ? 'Hoàn thành' :
                       log.status === 'CANCELLED' ? 'Đã hủy' : log.status,
                reason: log.reason === 'NEW_IMPORT' ? 'Nhập mới' :
                       log.reason === 'TRANSFER' ? 'Điều chuyển' :
                       log.reason === 'RETURN' ? 'Trả về' : 'Bảo trì'
            }));
            
            console.log('Formatted Logs:', formattedLogs);
            
            setLogs(formattedLogs);
            setPagination(prev => ({
                ...prev,
                total: response.data?.total || 0
            }));
        } catch (error) {
            console.error('Lỗi khi tải logs:', error);
            if (error.response?.status === 403) {
                showSnackbar('Phiên làm việc đã hết hạn, vui lòng đăng nhập lại', 'error');
            } else {
                showSnackbar('Lỗi khi tải dữ liệu', 'error');
            }
            setLogs([]);
        } finally {
            setLoading(false);
        }
    };

    const handleDeleteLogs = async () => {
        try {
            await axios.delete(
                'http://localhost:3076/api/vanminh/asset-transfer/logs',
                { 
                    ...getAuthConfig(),
                    data: { ids: selectedLogs }
                }
            );
            
            showSnackbar('Xóa thành công', 'success');
            setSelectedLogs([]);
            setOpenDeleteDialog(false);
            fetchLogs();
        } catch (error) {
            console.error('Lỗi khi xóa logs:', error);
            showSnackbar('Lỗi khi xóa dữ liệu', 'error');
        }
    };

    const handleFilterChange = (e) => {
        const { name, value } = e.target;
        setFilters(prev => ({
            ...prev,
            [name]: value
        }));

        setPagination(prev => ({ ...prev, page: 0 }));
    };

    // const handleApplyFilters = () => {
    //     setPagination(prev => ({ ...prev, page: 0 }));
    //     fetchLogs();
    // };

    const handleResetFilters = () => {
        setFilters({
            transferType: '',
            status: '',
            fromDate: '',
            toDate: ''
        });
        setPagination(prev => ({ ...prev, page: 0 }));
        fetchLogs();
    };

    // const getStatusColor = (status) => {
    //     switch (status) {
    //         case 'Chờ xử lý':
    //             return 'warning';
    //         case 'Hoàn thành':
    //             return 'success';
    //         case 'Đã hủy':
    //             return 'error';
    //         default:
    //             return 'default';
    //     }
    // };

    const columns = [
        { 
            id: 'checkbox',
            label: <Checkbox
                indeterminate={selectedLogs.length > 0 && selectedLogs.length < logs.length}
                checked={logs.length > 0 && selectedLogs.length === logs.length}
                onChange={(e) => {
                    if (e.target.checked) {
                        setSelectedLogs(logs.map(log => log._id));
                    } else {
                        setSelectedLogs([]);
                    }
                }}
            />,
            width: 50
        },
        { 
            id: 'assetName', 
            label: 'Tên tài sản',
            width: 250
        },
        { 
            id: 'transferType', 
            label: 'Loại',
            width: 120
        },
        { 
            id: 'quantity', 
            label: 'Số lượng',
            width: 100,
            align: 'center'
        },
        { 
            id: 'fromOffice', 
            label: 'Từ văn phòng',
            width: 150
        },
        { 
            id: 'toOffice', 
            label: 'Đến văn phòng',
            width: 150
        },
        { 
            id: 'transferBy', 
            label: 'Người thực hiện',
            width: 150
        },
        { 
            id: 'status', 
            label: 'Trạng thái',
            width: 120
        },
        { 
            id: 'createdAt', 
            label: 'Ngày tạo',
            width: 150,
            align: 'center'
        }
    ];

    const formatDateTime = (dateString) => {
        if (!dateString) return '';
        
        try {
            const date = new Date(dateString);
            if (isNaN(date.getTime())) {
                console.warn('Invalid date string:', dateString);
                return '';
            }
            
            // Format: "HH:mm:ss DD/MM/YYYY"
            const hours = date.getHours().toString().padStart(2, '0');
            const minutes = date.getMinutes().toString().padStart(2, '0');
            const seconds = date.getSeconds().toString().padStart(2, '0');
            const day = date.getDate().toString().padStart(2, '0');
            const month = (date.getMonth() + 1).toString().padStart(2, '0');
            const year = date.getFullYear();

            return `${hours}:${minutes}:${seconds} ${day}/${month}/${year}`;
        } catch (error) {
            console.error('Error formatting date:', error);
            return '';
        }
    };

    useEffect(() => {
        fetchLogs();
    }, [pagination.page, pagination.limit, filters.transferType, filters.status, filters.fromDate, filters.toDate]);

    return (
        <Box sx={tableStyles.pageContainer}>
            <Box sx={tableStyles.headerContainer}>
                <Typography variant="h4">Lịch sử điều chuyển tài sản</Typography>
                {selectedLogs.length > 0 && (
                    <Button
                        variant="contained"
                        color="error"
                        startIcon={<DeleteIcon />}
                        onClick={() => setOpenDeleteDialog(true)}
                    >
                        Xóa ({selectedLogs.length})
                    </Button>
                )}
            </Box>

            <Paper sx={tableStyles.paper}>
                <Grid container spacing={2} alignItems="center" sx={{ p: 2 }}>
                    <Grid item xs={12} sm={6} md={3}>
                        <FormControl fullWidth>
                            <InputLabel>Loại điều chuyển</InputLabel>
                            <Select
                                name="transferType"
                                value={filters.transferType}
                                onChange={handleFilterChange}
                                label="Loại điều chuyển"
                            >
                                <MenuItem value="">Tất cả</MenuItem>
                                <MenuItem value="IMPORT">Nhập kho</MenuItem>
                                <MenuItem value="EXPORT">Xuất kho</MenuItem>
                            </Select>
                        </FormControl>
                    </Grid>
                    <Grid item xs={12} sm={6} md={3}>
                        <FormControl fullWidth>
                            <InputLabel>Trạng thái</InputLabel>
                            <Select
                                name="status"
                                value={filters.status}
                                onChange={handleFilterChange}
                                label="Trạng thái"
                            >
                                <MenuItem value="">Tất cả</MenuItem>
                                <MenuItem value="PENDING">Chờ xử lý</MenuItem>
                                <MenuItem value="COMPLETED">Hoàn thành</MenuItem>
                                <MenuItem value="CANCELLED">Đã hủy</MenuItem>
                            </Select>
                        </FormControl>
                    </Grid>
                    <Grid item xs={12} sm={6} md={3}>
                        <TextField
                            fullWidth
                            type="datetime-local"
                            name="fromDate"
                            label="Từ ngày"
                            value={filters.fromDate}
                            onChange={handleFilterChange}
                            InputLabelProps={{ shrink: true }}
                        />
                    </Grid>
                    <Grid item xs={12} sm={6} md={3}>
                        <TextField
                            fullWidth
                            type="datetime-local"
                            name="toDate"
                            label="Đến ngày"
                            value={filters.toDate}
                            onChange={handleFilterChange}
                            InputLabelProps={{ shrink: true }}
                        />
                    </Grid>
                    <Grid item xs={12} sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end' }}>
                        <Button
                            variant="outlined"
                            onClick={handleResetFilters}
                        >
                            Đặt lại
                        </Button>
                    </Grid>
                </Grid>

                <TableContainer s={{ 
                    maxHeight: 'calc(100vh - 250px)',
                    '& .MuiTable-root': {
                        borderCollapse: 'separate',
                        borderSpacing: 0,
                    },
                    '& .MuiTableCell-root': {
                        whiteSpace: 'nowrap',
                        borderBottom: '1px solid rgba(224, 224, 224, 1)',
                        padding: '8px 16px',
                        '&:first-of-type': {
                            position: 'sticky',
                            left: 0,
                            zIndex: 1,
                            backgroundColor: 'inherit'
                        }
                    }
                }}>
                    {loading ? (
                        <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
                            <CircularProgress />
                        </Box>
                    ) : (
                        <Table stickyHeader>
                            <TableHead>
                                <TableRow>
                                    {columns.map(column => (
                                        <StyledTableCell
                                            key={column.id}
                                            align={column.align || 'left'}
                                            sx={{ 
                                                minWidth: column.width,
                                                width: column.width
                                            }}
                                        >
                                            {column.label}
                                        </StyledTableCell>
                                    ))}
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {logs.map(log => (
                                    <StyledTableRow key={log._id}>
                                        <StyledTableCell padding="checkbox">
                                            <Checkbox
                                                checked={selectedLogs.indexOf(log._id) !== -1}
                                                onChange={(e) => {
                                                    if (e.target.checked) {
                                                        setSelectedLogs([...selectedLogs, log._id]);
                                                    } else {
                                                        setSelectedLogs(selectedLogs.filter(id => id !== log._id));
                                                    }
                                                }}
                                            />
                                        </StyledTableCell>
                                        <StyledTableCell>
                                            <Tooltip title={`${log.assetName} (${log.assetCode})`}>
                                                <Box sx={{ ...tableStyles.cellContent, maxWidth: 250 }}>
                                                    {log.assetName} ({log.assetCode})
                                                </Box>
                                            </Tooltip>
                                        </StyledTableCell>
                                        <StyledTableCell>
                                            <TransferTypeChip
                                                label={log.transferType}
                                                type={log.transferType}
                                                size="small"
                                            />
                                        </StyledTableCell>
                                        <StyledTableCell align="center">
                                            {log.quantity}
                                        </StyledTableCell>
                                        <StyledTableCell>
                                            <Tooltip title={log.fromOffice}>
                                                <Box sx={{ ...tableStyles.cellContent, maxWidth: 150 }}>
                                                    {log.fromOffice}
                                                </Box>
                                            </Tooltip>
                                        </StyledTableCell>
                                        <StyledTableCell>
                                            <Tooltip title={log.toOffice}>
                                                <Box sx={{ ...tableStyles.cellContent, maxWidth: 150 }}>
                                                    {log.toOffice}
                                                </Box>
                                            </Tooltip>
                                        </StyledTableCell>
                                        <StyledTableCell>
                                            <Tooltip title={log.transferBy}>
                                                <Box sx={{ ...tableStyles.cellContent, maxWidth: 150 }}>
                                                    {log.transferBy}
                                                </Box>
                                            </Tooltip>
                                        </StyledTableCell>
                                        <StyledTableCell>
                                            <StatusChip
                                                label={log.status}
                                                status={log.status}
                                                size="small"
                                            />
                                        </StyledTableCell>
                                        <StyledTableCell align="center">
                                            {formatDateTime(log.createdAt)}
                                        </StyledTableCell>
                                    </StyledTableRow>
                                ))}
                            </TableBody>
                        </Table>
                    )}
                </TableContainer>
                <TablePagination
                    component="div"
                    count={pagination.total}
                    page={pagination.page}
                    onPageChange={(e, newPage) => setPagination(prev => ({ ...prev, page: newPage }))}
                    rowsPerPage={pagination.limit}
                    onRowsPerPageChange={(e) => setPagination(prev => ({ ...prev, limit: parseInt(e.target.value, 10), page: 0 }))}
                    rowsPerPageOptions={[5, 10, 25, 50]}
                    labelRowsPerPage="Số hàng mỗi trang:"
                    labelDisplayedRows={({ from, to, count }) => 
                        `${from}-${to} của ${count !== -1 ? count : `hơn ${to}`}`}
                />
            </Paper>

            <Dialog
                open={openDeleteDialog}
                onClose={() => setOpenDeleteDialog(false)}
            >
                <DialogTitle>Xác nhận xóa</DialogTitle>
                <DialogContent>
                    Bạn có chắc chắn muốn xóa {selectedLogs.length} bản ghi đã chọn?
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setOpenDeleteDialog(false)}>Hủy</Button>
                    <Button onClick={handleDeleteLogs} color="error">Xóa</Button>
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

export default AssetTransferHistory; 