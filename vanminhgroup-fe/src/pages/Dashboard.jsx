import React, { useState, useEffect } from 'react';
import {
    Box,
    Grid,
    Paper,
    Typography,
    CircularProgress,
    Card,
    CardContent,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow
} from '@mui/material';
import {
    Inventory as InventoryIcon,
    DirectionsCar as CarIcon,
    Business as OfficeIcon,
    People as PeopleIcon,
    Category as CategoryIcon
} from '@mui/icons-material';
import axios from 'axios';

const StatCard = ({ title, value, icon: Icon, color, subtitle }) => (
    <Card sx={{ height: '100%' }}>
        <CardContent>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <Icon sx={{ fontSize: 40, color: color, mr: 2 }} />
                <Box>
                    <Typography variant="h6" component="div">
                        {title}
                    </Typography>
                    {subtitle && (
                        <Typography variant="body2" color="text.secondary">
                            {subtitle}
                        </Typography>
                    )}
                </Box>
            </Box>
            <Typography variant="h4" component="div" sx={{ fontWeight: 'bold' }}>
                {value}
            </Typography>
        </CardContent>
    </Card>
);

const formatDateTime = (dateString) => {
    try {
        if (!dateString) {
            console.warn('Ngày không hợp lệ:', dateString);
            return 'Không có thông tin';
        }
        const date = new Date(dateString);
        if (isNaN(date.getTime())) {
            console.error('Không thể chuyển đổi ngày:', dateString);
            return 'Không có thông tin';
        }
        return date.toLocaleString('vi-VN', {
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit',
            day: '2-digit',
            month: '2-digit',
            year: 'numeric'
        });
    } catch (error) {
        console.error('Lỗi khi định dạng ngày:', error);
        return 'Không có thông tin';
    }
};

const Dashboard = () => {
    const [stats, setStats] = useState({
        totalAssets: 0,
        totalCars: 0,
        totalOffices: 0,
        totalUsers: 0,
        totalAssetTypes: 0,
        recentTransfers: [],
        assetByType: [],
        assetByOffice: []
    });
    const [loading, setLoading] = useState(true);

    const getAuthConfig = () => {
        const token = localStorage.getItem('token');
        return {
            headers: {
                'Authorization': token
            }
        };
    };

    useEffect(() => {
        const fetchStats = async () => {
            try {
                setLoading(true);
                const [
                    assetsResponse,
                    carsResponse,
                    officesResponse,
                    usersResponse,
                    assetTypesResponse,
                    transfersResponse
                ] = await Promise.all([
                    axios.get('http://localhost:3076/api/vanminh/asset', getAuthConfig()),
                    axios.get('http://localhost:3076/api/vanminh/car', getAuthConfig()),
                    axios.get('http://localhost:3076/api/vanminh/office', getAuthConfig()),
                    axios.get('http://localhost:3076/api/vanminh/account-vanminh', getAuthConfig()),
                    axios.get('http://localhost:3076/api/vanminh/asset-type', getAuthConfig()),
                    axios.get('http://localhost:3076/api/vanminh/asset-transfer/logs', {
                        ...getAuthConfig(),
                        params: { limit: 5 }
                    })
                ]);

                // Tính toán số lượng tài sản theo loại
                const assetByType = {};
                assetsResponse.data?.data?.forEach(asset => {
                    const type = asset.assetType?.label || 'Chưa phân loại';
                    assetByType[type] = (assetByType[type] || 0) + 1;
                });

                // Tính toán số lượng tài sản theo văn phòng
                const assetByOffice = {};
                assetsResponse.data?.data?.forEach(asset => {
                    const office = asset.managementOffice?.label || 'Chưa xác định';
                    assetByOffice[office] = (assetByOffice[office] || 0) + 1;
                });

                setStats({
                    totalAssets: assetsResponse.data?.total || 0,
                    totalCars: carsResponse.data?.total || 0,
                    totalOffices: officesResponse.data?.length || 0,
                    totalUsers: usersResponse.data?.total || 0,
                    totalAssetTypes: assetTypesResponse.data?.length || 0,
                    recentTransfers: transfersResponse.data?.logs || [],
                    assetByType: Object.entries(assetByType).map(([type, count]) => ({ type, count })),
                    assetByOffice: Object.entries(assetByOffice).map(([office, count]) => ({ office, count }))
                });
            } catch (error) {
                console.error('Error fetching stats:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchStats();
    }, []);

    if (loading) {
        return (
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
                <CircularProgress />
            </Box>
        );
    }

    return (
        <Box sx={{ p: 3 }}>
            <Typography variant="h4" sx={{ mb: 4 }}>
                Tổng quan hệ thống
            </Typography>

            <Grid container spacing={3}>
                <Grid item xs={12} sm={6} md={4} lg={2.4}>
                    <StatCard
                        title="Tổng tài sản"
                        value={stats.totalAssets}
                        icon={InventoryIcon}
                        color="#2196f3"
                        subtitle={`${stats.assetByType.length} loại tài sản`}
                    />
                </Grid>
                <Grid item xs={12} sm={6} md={4} lg={2.4}>
                    <StatCard
                        title="Tổng xe"
                        value={stats.totalCars}
                        icon={CarIcon}
                        color="#4caf50"
                        subtitle="Đang hoạt động"
                    />
                </Grid>
                <Grid item xs={12} sm={6} md={4} lg={2.4}>
                    <StatCard
                        title="Tổng văn phòng"
                        value={stats.totalOffices}
                        icon={OfficeIcon}
                        color="#ff9800"
                        subtitle="Đang hoạt động"
                    />
                </Grid>
                <Grid item xs={12} sm={6} md={4} lg={2.4}>
                    <StatCard
                        title="Tổng người dùng"
                        value={stats.totalUsers}
                        icon={PeopleIcon}
                        color="#9c27b0"
                        subtitle="Đang hoạt động"
                    />
                </Grid>
                <Grid item xs={12} sm={6} md={4} lg={2.4}>
                    <StatCard
                        title="Loại tài sản"
                        value={stats.totalAssetTypes}
                        icon={CategoryIcon}
                        color="#f44336"
                        subtitle="Đang sử dụng"
                    />
                </Grid>

                {/* Bảng tài sản theo loại */}
                <Grid item xs={12} md={6}>
                    <Paper sx={{ p: 2 }}>
                        <Typography variant="h6" sx={{ mb: 2 }}>
                            Tài sản theo loại
                        </Typography>
                        <TableContainer>
                            <Table size="small">
                                <TableHead>
                                    <TableRow>
                                        <TableCell>Loại tài sản</TableCell>
                                        <TableCell align="right">Số lượng</TableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {stats.assetByType.map((item) => (
                                        <TableRow key={item.type}>
                                            <TableCell>{item.type || 'Chưa phân loại'}</TableCell>
                                            <TableCell align="right">{item.count || 0}</TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </TableContainer>
                    </Paper>
                </Grid>

                {/* Bảng tài sản theo văn phòng */}
                <Grid item xs={12} md={6}>
                    <Paper sx={{ p: 2 }}>
                        <Typography variant="h6" sx={{ mb: 2 }}>
                            Tài sản theo văn phòng
                        </Typography>
                        <TableContainer>
                            <Table size="small">
                                <TableHead>
                                    <TableRow>
                                        <TableCell>Văn phòng</TableCell>
                                        <TableCell align="right">Số lượng</TableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {stats.assetByOffice.map((item) => (
                                        <TableRow key={item.office}>
                                            <TableCell>{item.office || 'Chưa xác định'}</TableCell>
                                            <TableCell align="right">{item.count || 0}</TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </TableContainer>
                    </Paper>
                </Grid>

                {/* Lịch sử gần đây */}
                <Grid item xs={12}>
                    <Paper sx={{ p: 2 }}>
                        <Typography variant="h6" sx={{ mb: 2 }}>
                            Lịch sử điều chuyển gần đây
                        </Typography>
                        <TableContainer>
                            <Table size="small">
                                <TableHead>
                                    <TableRow>
                                        <TableCell>Tên tài sản</TableCell>
                                        <TableCell>Loại</TableCell>
                                        <TableCell>Số lượng</TableCell>
                                        <TableCell>Từ văn phòng</TableCell>
                                        <TableCell>Đến văn phòng</TableCell>
                                        <TableCell>Người thực hiện</TableCell>
                                        <TableCell>Trạng thái</TableCell>
                                        <TableCell align="right">Ngày tạo</TableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {stats.recentTransfers.map((transfer) => (
                                        <TableRow key={transfer._id}>
                                            <TableCell>
                                                {transfer.assetId?.name || 'Không có tên'} ({transfer.assetId?.code || 'Không có mã'})
                                            </TableCell>
                                            <TableCell>
                                                {transfer.transferType === 'IMPORT' ? 'Nhập kho' : 'Xuất kho'}
                                            </TableCell>
                                            <TableCell>{transfer.quantity}</TableCell>
                                            <TableCell>{transfer.fromOffice?.label || 'Không có thông tin'}</TableCell>
                                            <TableCell>{transfer.toOffice?.label || 'Không có thông tin'}</TableCell>
                                            <TableCell>{transfer.transferBy?.name || 'Không có thông tin'}</TableCell>
                                            <TableCell>
                                                {transfer.status === 'PENDING' ? 'Chờ xử lý' : 
                                                 transfer.status === 'COMPLETED' ? 'Hoàn thành' :
                                                 transfer.status === 'CANCELLED' ? 'Đã hủy' : transfer.status}
                                            </TableCell>
                                            <TableCell align="right">
                                                {formatDateTime(transfer.createdAt)}
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </TableContainer>
                    </Paper>
                </Grid>
            </Grid>
        </Box>
    );
};

export default Dashboard; 