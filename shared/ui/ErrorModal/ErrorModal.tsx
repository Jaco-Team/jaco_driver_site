import React from 'react';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import ErrorOutlinedIcon from '@mui/icons-material/ErrorOutlined';

interface ErrorModalProps {
  open: boolean;
  errorText: string;
  onClose: () => void;
}

export const ErrorModal: React.FC<ErrorModalProps> = ({ open, errorText, onClose }) => {
  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="sm"
      fullWidth
      data-testid="error-modal"
      slotProps={{
        paper: {
          sx: {
            borderRadius: 2,
          },
        },
      }}
    >
      <DialogTitle sx={{ pb: 1 }}>
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            gap: 1,
          }}
        >
          <ErrorOutlinedIcon color="error" />
          <Typography variant="h6" component="span">
            Ошибка
          </Typography>
        </Box>
      </DialogTitle>
      <DialogContent>
        <Box sx={{ py: 2 }}>
          <Typography
            variant="body1"
            sx={{
              color: 'text.secondary',
              whiteSpace: 'pre-line',
            }}
          >
            {errorText || 'Произошла неизвестная ошибка'}
          </Typography>
        </Box>
      </DialogContent>
      <DialogActions sx={{ p: 2, pt: 0 }}>
        <Button onClick={onClose} variant="contained" color="primary">
          Закрыть
        </Button>
      </DialogActions>
    </Dialog>
  );
};
