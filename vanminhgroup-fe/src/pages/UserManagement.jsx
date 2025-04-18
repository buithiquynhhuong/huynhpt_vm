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
    Alert,
    Snackbar,
    FormControl,
    InputLabel,
    Select,
    MenuItem,
    Grid,
    Tooltip,
} from '@mui/material';
import {
    Add as AddIcon,
    Search as SearchIcon,
} from '@mui/icons-material';
import DataTable from '../components/DataTable';
import userApi from '../api/userApi';
import departmentApi from '../api/departmentApi';
import officeApi from '../api/officeApi';
import teamApi from '../api/teamApi';

const UserManagement = () => {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [total, setTotal] = useState(0);
    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(10);
    const [openDialog, setOpenDialog] = useState(false);
    const [selectedUser, setSelectedUser] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
    
    // Dữ liệu từ database
    const [departments, setDepartments] = useState([]);
    const [offices, setOffices] = useState([]);
    const [teams, setTeams] = useState([]);
    
    // Form data
    const [formData, setFormData] = useState({
        phone: '',
        password: '',
        name: '',
        officeID: [],
        ruler: [],
        avatar: '',
        dateOfBirth: '',
        email: '',
        status: true,
        position: '',
        tokenVersion: 0
    });

    // Load dữ liệu từ database
    const loadData = useCallback(async () => {
        try {
            const [deptResponse, officeResponse, teamResponse] = await Promise.all([
                departmentApi.getAll(),
                officeApi.getAll(),
                teamApi.getAll()
            ]);
            setDepartments(deptResponse);
            setOffices(officeResponse);
            setTeams(teamResponse);
        } catch (error) {
            showSnackbar('Lỗi khi tải dữ liệu', 'error');
        }
    }, []);

    useEffect(() => {
        loadData();
    }, [loadData]);

    const fetchUsers = useCallback(async () => {
        try {
            setLoading(true);
            const response = await userApi.getAll(page + 1, rowsPerPage);
            if (response && response.account) {
                setUsers(response.account);
                setTotal(response.total || 0);
            } else {
                setUsers([]);
                setTotal(0);
                showSnackbar('Không có dữ liệu người dùng', 'info');
            }
        } catch (error) {
            console.error('Error fetching users:', error);
            setUsers([]);
            setTotal(0);
            showSnackbar('Lỗi khi tải dữ liệu người dùng: ' + (error.response?.data?.message || error.message), 'error');
        } finally {
            setLoading(false);
        }
    }, [page, rowsPerPage]);

    useEffect(() => {
        fetchUsers();
    }, [fetchUsers, page, rowsPerPage]);

    const handleEdit = (user) => {
        handleOpenDialog(user);
    };

    const handleDelete = async (id) => {
        try {
            await userApi.delete([id]);
            showSnackbar('Xóa người dùng thành công');
            fetchUsers();
        } catch (error) {
            showSnackbar('Lỗi khi xóa người dùng', 'error');
        }
    };

    const handleOpenDialog = (user = null) => {
        if (user) {
            setSelectedUser(user);
            setFormData({
                ...user,
                password: '', // Không hiển thị mật khẩu
                officeID: Array.isArray(user.officeID) ? user.officeID : [],
                ruler: Array.isArray(user.ruler) ? user.ruler : [],
                dateOfBirth: user.dateOfBirth ? new Date(user.dateOfBirth).toISOString().split('T')[0] : '',
            });
        } else {
            setSelectedUser(null);
            setFormData({
                phone: '',
                password: '',
                name: '',
                officeID: [],
                ruler: [],
                avatar: '',
                dateOfBirth: '',
                email: '',
                status: true,
                position: '',
                tokenVersion: 0
            });
        }
        setOpenDialog(true);
    };

    const handleCloseDialog = () => {
        setOpenDialog(false);
        setSelectedUser(null);
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        
        if (name === 'officeID') {
            // Xử lý khi chọn văn phòng
            const selectedOffice = offices.find(office => office._id === value);
            if (selectedOffice) {
                setFormData(prev => ({
                    ...prev,
                    officeID: [...prev.officeID, {
                        _id: selectedOffice._id,
                        departmentID: selectedOffice.departmentID,
                        teamID: selectedOffice.teamID
                    }]
                }));
            }
        } else if (name === 'ruler') {
            // Xử lý khi chọn quyền
            setFormData(prev => ({
                ...prev,
                ruler: Array.isArray(value) ? value : [value]
            }));
        } else if (name === 'dateOfBirth') {
            // Xử lý ngày sinh
            setFormData(prev => ({
                ...prev,
                [name]: value
            }));
        } else {
            setFormData(prev => ({
                ...prev,
                [name]: value
            }));
        }
    };

    const handleSubmit = async () => {
        try {
            if (selectedUser) {
                await userApi.update(selectedUser._id, formData);
                showSnackbar('Cập nhật thành công');
            } else {
                await userApi.create(formData);
                showSnackbar('Thêm mới thành công');
            }
            handleCloseDialog();
            fetchUsers();
        } catch (error) {
            showSnackbar('Có lỗi xảy ra', 'error');
        }
    };

    const handleCloseSnackbar = () => {
        setSnackbar(prev => ({ ...prev, open: false }));
    };

    const showSnackbar = (message, severity = 'success') => {
        setSnackbar({ open: true, message, severity });
    };

    const columns = [
        { 
            field: 'avatar', 
            headerName: 'Ảnh',
            width: 80,
            renderCell: (row) => row.avatar ? (
                <img 
                    src={row.avatar} 
                    alt={row.name} 
                    style={{ 
                        width: 40, 
                        height: 40, 
                        borderRadius: '50%',
                        objectFit: 'cover'
                    }} 
                />
            ) : null
        },
        { 
            field: 'name', 
            headerName: 'Tên',
            width: 150,
            renderCell: (row) => (
                <Tooltip title={row.name || ''}>
                    <Box sx={{ 
                        maxWidth: 150,
                        whiteSpace: 'nowrap',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis'
                    }}>
                        {row.name}
                    </Box>
                </Tooltip>
            )
        },
        { 
            field: 'phone', 
            headerName: 'SĐT',
            width: 120
        },
        { 
            field: 'email', 
            headerName: 'Email',
            width: 200,
            renderCell: (row) => (
                <Tooltip title={row.email || ''}>
                    <Box sx={{ 
                        maxWidth: 200,
                        whiteSpace: 'nowrap',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis'
                    }}>
                        {row.email}
                    </Box>
                </Tooltip>
            )
        },
        { 
            field: 'dateOfBirth', 
            headerName: 'Ngày sinh',
            width: 100,
            renderCell: (row) => row.dateOfBirth ? new Date(row.dateOfBirth).toLocaleDateString('vi-VN') : ''
        },
        { 
            field: 'officeID', 
            headerName: 'Văn phòng',
            width: 150,
            renderCell: (row) => {
                const officeText = Array.isArray(row.officeID) 
                    ? row.officeID.map(office => typeof office === 'object' ? office.label || office.name || '' : office)
                        .filter(Boolean)
                        .join(', ')
                    : '';
                return (
                    <Tooltip title={officeText}>
                        <Box sx={{ 
                            maxWidth: 150,
                            whiteSpace: 'nowrap',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis'
                        }}>
                            {officeText}
                        </Box>
                    </Tooltip>
                );
            }
        },
        { 
            field: 'ruler', 
            headerName: 'Vị trí',
            width: 150,
            renderCell: (row) => {
                const rulerText = Array.isArray(row.ruler) 
                    ? row.ruler.map(r => typeof r === 'object' ? r.label || r.name || '' : r)
                        .filter(Boolean)
                        .join(', ')
                    : '';
                return (
                    <Tooltip title={rulerText}>
                        <Box sx={{ 
                            maxWidth: 150,
                            whiteSpace: 'nowrap',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis'
                        }}>
                            {rulerText}
                        </Box>
                    </Tooltip>
                );
            }
        },
        { 
            field: 'position', 
            headerName: 'Quyền hạn',
            width: 100,
            renderCell: (row) => row.position || ''
        },
        { 
            field: 'status', 
            headerName: 'Trạng thái',
            width: 130,
            renderCell: (row) => (
                <Box
                    sx={{
                        backgroundColor: row.status ? '#4caf50' : '#f44336',
                        color: 'white',
                        padding: '4px 8px',
                        borderRadius: '4px',
                        fontSize: '0.875rem',
                        minWidth: '120px',
                        textAlign: 'center'
                    }}
                >
                    {row.status ? 'Hoạt động' : 'Không hoạt động'}
                </Box>
            )
        }
    ];

    const filteredUsers = users.filter(user =>
        user.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.phone?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.email?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <Box sx={{ 
            pl: 0.5,
            pr: 2,
            pt: 2,
            pb: 2
        }}>
            <Box sx={{ 
                display: 'flex', 
                justifyContent: 'space-between', 
                mb: 2,
                pl: 1
            }}>
                <Typography variant="h4">Quản lý người dùng</Typography>
                <Button
                    variant="contained"
                    startIcon={<AddIcon />}
                    onClick={() => handleOpenDialog()}
                >
                    Thêm mới
                </Button>
            </Box>

            <Box sx={{ mb: 2 }}>
                <TextField
                    placeholder="Tìm kiếm theo tên, số điện thoại hoặc email"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    fullWidth
                    InputProps={{
                        startAdornment: <SearchIcon sx={{ mr: 1, color: 'text.secondary' }} />,
                    }}
                    sx={{ 
                        mb: 2,
                        pl: 1,
                        pr: 1
                    }}
                />

                <Box sx={{ 
                    width: '100%',
                    '& .MuiPaper-root': {
                        boxShadow: 'none',
                        borderRadius: 0
                    }
                }}>
                    <DataTable
                        columns={columns}
                        data={filteredUsers}
                        onEdit={handleEdit}
                        onDelete={handleDelete}
                        loading={loading}
                        page={page}
                        rowsPerPage={rowsPerPage}
                        onPageChange={(event, newPage) => setPage(newPage)}
                        onRowsPerPageChange={(event) => {
                            setRowsPerPage(parseInt(event.target.value, 10));
                            setPage(0);
                        }}
                    />
                </Box>
            </Box>

            <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
                <DialogTitle>
                    {selectedUser ? 'Cập nhật thông tin' : 'Thêm mới nhân viên'}
                </DialogTitle>
                <DialogContent>
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 2 }}>
                        <Grid container spacing={2}>
                            <Grid item xs={12}>
                                <TextField
                                    label="Họ và tên"
                                    name="name"
                                    value={formData.name}
                                    onChange={handleInputChange}
                                    fullWidth
                                />
                            </Grid>
                            <Grid item xs={12} sm={6}>
                                <TextField
                                    label="Số điện thoại"
                                    name="phone"
                                    value={formData.phone}
                                    onChange={handleInputChange}
                                    fullWidth
                                />
                            </Grid>
                            <Grid item xs={12} sm={6}>
                                <TextField
                                    label="Email"
                                    name="email"
                                    value={formData.email}
                                    onChange={handleInputChange}
                                    fullWidth
                                />
                            </Grid>
                            <Grid item xs={12}>
                                <TextField
                                    label="Mật khẩu"
                                    name="password"
                                    type="password"
                                    value={formData.password}
                                    onChange={handleInputChange}
                                    fullWidth
                                />
                            </Grid>
                            <Grid item xs={12}>
                                <TextField
                                    label="Ngày sinh"
                                    name="dateOfBirth"
                                    type="date"
                                    value={formData.dateOfBirth}
                                    onChange={handleInputChange}
                                    fullWidth
                                    InputLabelProps={{
                                        shrink: true,
                                    }}
                                />
                            </Grid>
                            <Grid item xs={12}>
                                <FormControl fullWidth>
                                    <InputLabel>Văn phòng</InputLabel>
                                    <Select
                                        multiple
                                        name="officeID"
                                        value={formData.officeID.map(office => office._id)}
                                        onChange={handleInputChange}
                                        label="Văn phòng"
                                    >
                                        {offices.map((office) => (
                                            <MenuItem key={office._id} value={office._id}>
                                                {office.label}
                                            </MenuItem>
                                        ))}
                                    </Select>
                                </FormControl>
                            </Grid>
                            <Grid item xs={12}>
                                <FormControl fullWidth>
                                    <InputLabel>Vị trí</InputLabel>
                                    <Select
                                        multiple
                                        name="ruler"
                                        value={formData.ruler}
                                        onChange={handleInputChange}
                                        label="Vị trí"
                                    >
                                        <MenuItem value="Bến xe Phía Đông">Bến xe Phía Đông</MenuItem>
                                        <MenuItem value="Gia lâm">Gia lâm</MenuItem>
                                        <MenuItem value="Văn phòng tổng công ty">Văn phòng tổng công ty</MenuItem>
                                        <MenuItem value="Ngọc Hồi">Ngọc Hồi</MenuItem>
                                        <MenuItem value="Xuân Mai">Xuân Mai</MenuItem>
                                    </Select>
                                </FormControl>
                            </Grid>
                            <Grid item xs={12}>
                                <TextField
                                    label="Quyền hạn"
                                    name="position"
                                    value={formData.position}
                                    onChange={handleInputChange}
                                    fullWidth
                                />
                            </Grid>
                            <Grid item xs={12}>
                                <FormControl fullWidth>
                                    <InputLabel>Trạng thái</InputLabel>
                                    <Select
                                        name="status"
                                        value={formData.status}
                                        onChange={handleInputChange}
                                        label="Trạng thái"
                                    >
                                        <MenuItem value={true}>Đang hoạt động</MenuItem>
                                        <MenuItem value={false}>Không hoạt động</MenuItem>
                                    </Select>
                                </FormControl>
                            </Grid>
                        </Grid>
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

export default UserManagement;