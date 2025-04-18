import React from "react";
import {
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  Box,
  Typography,
  TablePagination,
  TableSortLabel,
  Tooltip,
  useTheme,
  useMediaQuery,
  styled,
  Chip,
  Avatar,
  Skeleton
} from "@mui/material";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import InfoIcon from "@mui/icons-material/Info";
import WarningIcon from "@mui/icons-material/Warning";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import ErrorIcon from "@mui/icons-material/Error";
import { visuallyHidden } from '@mui/utils';

const StyledTableCell = styled(TableCell)(({ theme }) => ({
  padding: theme.spacing(2),
  '&.MuiTableCell-head': {
    backgroundColor: theme.palette.primary.dark,
    color: theme.palette.common.white,
    fontWeight: 'bold',
    fontSize: '0.95rem',
    '& .MuiTableSortLabel-root': {
      color: theme.palette.common.white,
      '&:hover': {
        color: theme.palette.primary.light,
      },
      '&.Mui-active': {
        color: theme.palette.primary.light,
      },
    },
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

const ActionCell = styled(Box)(({ theme }) => ({
  display: 'flex',
  gap: theme.spacing(1),
  justifyContent: 'flex-end',
}));

const StatusChip = styled(Chip)(({ theme, status }) => ({
  backgroundColor: 
    status === 'active' ? theme.palette.success.light + '30' :
    status === 'inactive' ? theme.palette.error.light + '30' :
    status === 'pending' ? theme.palette.warning.light + '30' :
    theme.palette.grey[100],
  color: 
    status === 'active' ? theme.palette.success.dark :
    status === 'inactive' ? theme.palette.error.dark :
    status === 'pending' ? theme.palette.warning.dark :
    theme.palette.grey[700],
  fontWeight: 500,
  '& .MuiChip-icon': {
    color: 'inherit',
  },
}));

function DataTable(props) {
  const { 
    columns = [], 
    data = [], 
    onEdit, 
    onDelete, 
    actions = true,
    pagination = true,
    rowsPerPageOptions = [5, 10, 25],
    defaultRowsPerPage = 10,
    loading = false,
    rowsPerPage = defaultRowsPerPage,
    page = 0,
    onPageChange,
    onRowsPerPageChange,
    count = 0,
    totalPages = 1
  } = props;

  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const [orderBy, setOrderBy] = React.useState('');
  const [order, setOrder] = React.useState('asc');

  const handleChangePage = (event, newPage) => {
    if (onPageChange) {
      onPageChange(newPage);
    }
  };

  const handleChangeRowsPerPage = (event) => {
    if (onRowsPerPageChange) {
      onRowsPerPageChange(parseInt(event.target.value, 10));
    }
  };

  const handleRequestSort = (property) => {
    const isAsc = orderBy === property && order === 'asc';
    setOrder(isAsc ? 'desc' : 'asc');
    setOrderBy(property);
  };

  const stableSort = (array, comparator) => {
    const stabilizedThis = array.map((el, index) => [el, index]);
    stabilizedThis.sort((a, b) => {
      const order = comparator(a[0], b[0]);
      if (order !== 0) return order;
      return a[1] - b[1];
    });
    return stabilizedThis.map((el) => el[0]);
  };

  const getComparator = (order, orderBy) => {
    return order === 'desc'
      ? (a, b) => descendingComparator(a, b, orderBy)
      : (a, b) => -descendingComparator(a, b, orderBy);
  };

  const descendingComparator = (a, b, orderBy) => {
    if (b[orderBy] < a[orderBy]) {
      return -1;
    }
    if (b[orderBy] > a[orderBy]) {
      return 1;
    }
    return 0;
  };

  const sortedData = stableSort(data, getComparator(order, orderBy));
  const paginatedData = data;

  const renderStatusIcon = (status) => {
    switch (status) {
      case 'active':
        return <CheckCircleIcon fontSize="small" />;
      case 'inactive':
        return <ErrorIcon fontSize="small" />;
      case 'pending':
        return <WarningIcon fontSize="small" />;
      default:
        return <InfoIcon fontSize="small" />;
    }
  };

  const renderStatusCell = (row, field) => {
    const status = row[field];
    return (
      <StatusChip
        icon={renderStatusIcon(status)}
        label={status === 'active' ? 'Hoạt động' : 
               status === 'inactive' ? 'Không hoạt động' : 
               status === 'pending' ? 'Đang chờ' : 'Không xác định'}
        status={status}
      />
    );
  };

  const renderActionButtons = (row) => {
    return (
      <ActionCell>
        {onEdit && (
          <Tooltip title="Chỉnh sửa">
            <IconButton 
              onClick={() => onEdit(row)} 
              color="primary"
              size={isMobile ? "small" : "medium"}
              sx={{
                backgroundColor: theme.palette.primary.light + '20',
                '&:hover': {
                  backgroundColor: theme.palette.primary.light + '40',
                },
              }}
            >
              <EditIcon />
            </IconButton>
          </Tooltip>
        )}
        {onDelete && (
          <Tooltip title="Xóa">
            <IconButton 
              onClick={() => onDelete(row._id)} 
              color="error"
              size={isMobile ? "small" : "medium"}
              sx={{
                backgroundColor: theme.palette.error.light + '20',
                '&:hover': {
                  backgroundColor: theme.palette.error.light + '40',
                },
              }}
            >
              <DeleteIcon />
            </IconButton>
          </Tooltip>
        )}
      </ActionCell>
    );
  };

  const renderLoadingRows = () => {
    return Array(rowsPerPage).fill(0).map((_, index) => (
      <StyledTableRow key={index}>
        {columns.map((column) => (
          <StyledTableCell key={column.field} align={column.align || "left"}>
            <Skeleton animation="wave" height={24} />
          </StyledTableCell>
        ))}
        {actions && (
          <StyledTableCell align="right">
            <Box sx={{ display: 'flex', gap: 1, justifyContent: 'flex-end' }}>
              <Skeleton variant="circular" width={32} height={32} />
              <Skeleton variant="circular" width={32} height={32} />
            </Box>
          </StyledTableCell>
        )}
      </StyledTableRow>
    ));
  };

  if (!columns.length || !data.length) {
    return (
      <Paper 
        sx={{ 
          p: 3, 
          textAlign: 'center',
          backgroundColor: theme.palette.grey[50],
          borderRadius: 2,
        }}
      >
        <InfoIcon sx={{ fontSize: 40, color: theme.palette.grey[400], mb: 1 }} />
        <Typography color="text.secondary" variant="h6">
          Không có dữ liệu để hiển thị
        </Typography>
      </Paper>
    );
  }

  return (
    <Paper 
      sx={{ 
        width: '100%',
        overflow: 'hidden',
        borderRadius: 2,
        boxShadow: theme.shadows[3],
      }}
    >
      <TableContainer>
        <Table aria-label="data table" size={isMobile ? "small" : "medium"}>
          <TableHead>
            <TableRow>
              {columns.map((column) => (
                <StyledTableCell
                  key={column.field}
                  align={column.align || "left"}
                  sortDirection={orderBy === column.field ? order : false}
                  sx={{
                    whiteSpace: 'nowrap',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    maxWidth: column.width || 'auto',
                  }}
                >
                  <TableSortLabel
                    active={orderBy === column.field}
                    direction={orderBy === column.field ? order : 'asc'}
                    onClick={() => handleRequestSort(column.field)}
                  >
                    {column.headerName}
                    {orderBy === column.field ? (
                      <Box component="span" sx={visuallyHidden}>
                        {order === 'desc' ? 'sorted descending' : 'sorted ascending'}
                      </Box>
                    ) : null}
                  </TableSortLabel>
                </StyledTableCell>
              ))}
              {actions && (
                <StyledTableCell align="right" sx={{ width: '120px', minWidth: '120px' }}>
                  Thao tác
                </StyledTableCell>
              )}
            </TableRow>
          </TableHead>
          <TableBody>
            {loading ? renderLoadingRows() : data.length === 0 ? (
              <TableRow>
                <TableCell colSpan={columns.length + (actions ? 1 : 0)} align="center">
                  Không có dữ liệu
                </TableCell>
              </TableRow>
            ) : (
              data.map((row, index) => (
                <StyledTableRow key={row._id || index}>
                  {columns.map((column) => (
                    <StyledTableCell 
                      key={column.field} 
                      align={column.align || "left"}
                      sx={{
                        whiteSpace: 'nowrap',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        maxWidth: column.width || 'auto',
                      }}
                    >
                      <Tooltip title={String(row[column.field] || '')}>
                        <Box component="span" sx={{ 
                          display: 'block',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis'
                        }}>
                          {column.field === 'status' 
                            ? renderStatusCell(row, column.field)
                            : column.renderCell 
                              ? column.renderCell(row) 
                              : typeof row[column.field] === 'object'
                                ? row[column.field]?.label || 'Không có thông tin'
                                : row[column.field] || 'Không có thông tin'}
                        </Box>
                      </Tooltip>
                    </StyledTableCell>
                  ))}
                  {actions && (
                    <StyledTableCell align="right" sx={{ width: '120px', minWidth: '120px' }}>
                      {renderActionButtons(row)}
                    </StyledTableCell>
                  )}
                </StyledTableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>
      {pagination && (
        <TablePagination
          component="div"
          count={count}
          page={page}
          onPageChange={handleChangePage}
          rowsPerPage={rowsPerPage}
          onRowsPerPageChange={handleChangeRowsPerPage}
          rowsPerPageOptions={rowsPerPageOptions}
          labelDisplayedRows={({ from, to, count }) => 
            `${from}-${to} của ${count}`
          }
          labelRowsPerPage="Số hàng mỗi trang:"
        />
      )}
    </Paper>
  );
}

export default DataTable;
