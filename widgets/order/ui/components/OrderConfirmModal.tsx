import React from 'react';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import WarningIcon from '@mui/icons-material/Warning';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CancelIcon from '@mui/icons-material/Cancel';
import PersonOffIcon from '@mui/icons-material/PersonOff';

interface OrderConfirmModalProps {
  open: boolean;
  orderId: number | null;
  typeConfirm: string | null;
  onClose: () => void;
  onConfirm: () => void;
}

export const OrderConfirmModal: React.FC<OrderConfirmModalProps> = ({
  open,
  orderId,
  typeConfirm,
  onClose,
  onConfirm,
}) => {
  const getConfig = () => {
    switch (typeConfirm) {
      case 'finish':
        return {
          title: 'Завершение заказа',
          message: `Вы действительно хотите завершить заказ #${orderId}?`,
          icon: <CheckCircleIcon sx={{ fontSize: 48, color: '#4caf50' }} />,
          confirmText: 'Завершить',
          confirmColor: 'success' as const,
        };
      case 'cancel':
        return {
          title: 'Отмена заказа',
          message: `Вы действительно хотите отменить заказ #${orderId}?`,
          icon: <CancelIcon sx={{ fontSize: 48, color: '#f44336' }} />,
          confirmText: 'Отменить',
          confirmColor: 'error' as const,
        };
      case 'take':
        return {
          title: 'Взятие заказа',
          message: `Вы действительно хотите взять заказ #${orderId}?`,
          icon: <CheckCircleIcon sx={{ fontSize: 48, color: '#2196f3' }} />,
          confirmText: 'Взять',
          confirmColor: 'primary' as const,
        };
      case 'fake':
        return {
          title: 'Клиент не вышел на связь',
          message: `Подтвердите, что клиент не вышел на связь по заказу #${orderId}?`,
          icon: <PersonOffIcon sx={{ fontSize: 48, color: '#ff9800' }} />,
          confirmText: 'Подтвердить',
          confirmColor: 'warning' as const,
        };
      default:
        return {
          title: 'Подтверждение действия',
          message: `Подтвердите действие для заказа #${orderId}`,
          icon: <WarningIcon sx={{ fontSize: 48, color: '#ff9800' }} />,
          confirmText: 'Подтвердить',
          confirmColor: 'primary' as const,
        };
    }
  };

  const config = getConfig();

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="xs"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: 3,
          padding: 1,
        },
      }}
    >
      <DialogTitle sx={{ textAlign: 'center', pb: 1 }}>
        <Box display="flex" flexDirection="column" alignItems="center" gap={1}>
          {config.icon}
          <Typography variant="h6" component="span">
            {config.title}
          </Typography>
        </Box>
      </DialogTitle>
      <DialogContent>
        <Typography variant="body1" textAlign="center" color="text.secondary">
          {config.message}
        </Typography>
      </DialogContent>
      <DialogActions sx={{ justifyContent: 'center', gap: 2, pb: 3 }}>
        <Button onClick={onClose} variant="outlined" color="inherit" size="large">
          Нет
        </Button>
        <Button
          onClick={onConfirm}
          variant="contained"
          color={config.confirmColor}
          size="large"
          autoFocus
        >
          {config.confirmText}
        </Button>
      </DialogActions>
    </Dialog>
  );
};
