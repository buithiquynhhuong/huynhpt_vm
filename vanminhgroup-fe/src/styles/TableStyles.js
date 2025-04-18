export const tableStyles = {
    paper: {
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
            whiteSpace: 'nowrap',
            position: 'sticky',
            top: 0,
            zIndex: 1
        },
        '& .MuiTableCell-root': {
            borderBottom: '1px solid rgba(224, 224, 224, 1)',
            padding: '8px 16px',
            fontSize: '0.875rem'
        },
        '& .MuiTablePagination-root': {
            backgroundColor: '#f5f5f5',
            borderTop: '1px solid rgba(224, 224, 224, 1)',
            position: 'sticky',
            bottom: 0,
            zIndex: 1
        }
    },
    cellContent: {
        whiteSpace: 'nowrap',
        overflow: 'hidden',
        textOverflow: 'ellipsis',
        maxWidth: {
            xs: '100px', // điện thoại
            sm: '150px', // tablet
            md: '200px', // desktop nhỏ
            lg: '250px'  // desktop lớn
        }
    },
    pageContainer: {
        pl: 0,
        pr: 2,
        pt: 2,
        pb: 2,
        ml: 0,
        width: '100%',
        boxSizing: 'border-box'
    },
    headerContainer: {
        display: 'flex',
        justifyContent: 'space-between',
        mb: 2,
        flexDirection: {
            xs: 'column',
            sm: 'row'
        },
        gap: 2,
        pl: 1
    },
    tableContainer: {
        width: '100%',
        overflow: 'auto',
        maxHeight: 'calc(100vh - 250px)', // Chiều cao tối đa cho table
        '&::-webkit-scrollbar': {
            width: '8px',
            height: '8px'
        },
        '&::-webkit-scrollbar-track': {
            backgroundColor: '#f1f1f1'
        },
        '&::-webkit-scrollbar-thumb': {
            backgroundColor: '#888',
            borderRadius: '4px',
            '&:hover': {
                backgroundColor: '#555'
            }
        }
    }
}; 