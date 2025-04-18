import React from 'react';
import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Button,
    TextField,
    Grid,
    Box
} from '@mui/material';

const FormDialog = ({
    open,
    onClose,
    title,
    formData,
    onChange,
    onSubmit,
    fields,
    editMode = false
}) => {
    return (
        <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
            <DialogTitle>{title}</DialogTitle>
            <DialogContent>
                <Box sx={{ mt: 2 }}>
                    <Grid container spacing={2}>
                        {fields.map((field) => (
                            <Grid item xs={12} sm={6} key={field.name}>
                                <TextField
                                    fullWidth
                                    label={field.label}
                                    name={field.name}
                                    value={formData[field.name] || ''}
                                    onChange={onChange}
                                    type={field.type || 'text'}
                                    select={field.type === 'select'}
                                    SelectProps={{
                                        native: true
                                    }}
                                    disabled={field.disabled}
                                    required={field.required}
                                >
                                    {field.type === 'select' && field.options && 
                                        field.options.map((option) => (
                                            <option key={option.value} value={option.value}>
                                                {option.label}
                                            </option>
                                        ))
                                    }
                                </TextField>
                            </Grid>
                        ))}
                    </Grid>
                </Box>
            </DialogContent>
            <DialogActions>
                <Button onClick={onClose}>Hủy</Button>
                <Button 
                    onClick={onSubmit} 
                    variant="contained" 
                    color="primary"
                >
                    {editMode ? 'Cập nhật' : 'Thêm mới'}
                </Button>
            </DialogActions>
        </Dialog>
    );
};

export default FormDialog; 