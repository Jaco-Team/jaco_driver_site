import React from 'react';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import CircularProgress from '@mui/material/CircularProgress';
import SwipeableDrawer from '@mui/material/SwipeableDrawer';
import Typography from '@mui/material/Typography';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CancelIcon from '@mui/icons-material/Cancel';
import PersonOffIcon from '@mui/icons-material/PersonOff';
import WarningIcon from '@mui/icons-material/Warning';

import { useHeaderStore } from '@/features/header/model/header.store';
import { appPalette } from '@/shared/styles/appPalette';
import { ORDER_CARD_BUTTON_HEIGHT } from '@/widgets/order/ui/components/OrderCard';

interface OrderConfirmModalProps {
  open: boolean;
  orderId: number | null;
  typeConfirm: string | null;
  busy?: boolean;
  onClose: () => void;
  onConfirm: () => void;
}

function clampFontSize(value: number, min: number, max: number) {
  return Math.min(Math.max(value, min), max);
}

function getConfig(typeConfirm: string | null, orderId: number | null) {
  const orderLabel = orderId ? `#${orderId}` : '';

  switch (typeConfirm) {
    case 'finish':
      return {
        title: 'Завершить заказ',
        message: `Заказ ${orderLabel} будет отмечен как доставленный.`,
        confirmText: 'Завершить',
        confirmColor: '#2196F3',
        icon: <CheckCircleIcon />,
      };
    case 'cancel':
      return {
        title: 'Отменить заказ',
        message: `Заказ ${orderLabel} вернётся в общую очередь.`,
        confirmText: 'Отменить',
        confirmColor: appPalette.brand,
        icon: <CancelIcon />,
      };
    case 'take':
      return {
        title: 'Взять заказ',
        message: `Заказ ${orderLabel} будет назначен вам.`,
        confirmText: 'Взять',
        confirmColor: '#4CAF50',
        icon: <CheckCircleIcon />,
      };
    case 'fake':
      return {
        title: 'Клиент не вышел на связь',
        message: `Подтвердите по заказу ${orderLabel}.`,
        confirmText: 'Подтвердить',
        confirmColor: '#ff9800',
        icon: <PersonOffIcon />,
      };
    default:
      return {
        title: 'Подтверждение',
        message: `Подтвердите действие для заказа ${orderLabel}.`,
        confirmText: 'Подтвердить',
        confirmColor: appPalette.primary,
        icon: <WarningIcon />,
      };
  }
}

export const OrderConfirmModal: React.FC<OrderConfirmModalProps> = ({
  open,
  orderId,
  typeConfirm,
  busy = false,
  onClose,
  onConfirm,
}) => {
  const globalFontSize = useHeaderStore((state) => state.globalFontSize);
  const titleFontSize = clampFontSize(globalFontSize + 4, 18, 24);
  const bodyFontSize = clampFontSize(globalFontSize, 14, 18);
  const actionFontSize = clampFontSize(globalFontSize + 1, 14, 18);
  const config = getConfig(typeConfirm, orderId);

  return (
    <SwipeableDrawer
      anchor="bottom"
      open={open}
      onClose={() => {
        if (busy) return;
        onClose();
      }}
      onOpen={() => {}}
      disableSwipeToOpen
      data-testid="order-confirm-modal"
      slotProps={{
        paper: {
          sx: {
            borderTopLeftRadius: 28,
            borderTopRightRadius: 28,
            maxHeight: '75vh',
            height: 'auto',
            bottom: 0,
            top: 'auto',
            background: '#ffffff',
            overflow: 'hidden',
            border: `1px solid ${appPalette.softStrong}`,
            boxShadow: '0 24px 44px rgba(31, 43, 54, 0.2)',
            zIndex: (theme) => theme.zIndex.modal + 2,
          },
        },
      }}
      sx={{
        zIndex: (theme) => theme.zIndex.modal + 2,
      }}
    >
      <Box
        sx={{
          px: 2.5,
          pt: 1.15,
          pb: 'calc(env(safe-area-inset-bottom, 0px) + 28px)',
        }}
      >
        <Box
          sx={{
            width: '100%',
            display: 'flex',
            justifyContent: 'center',
            pb: 1.5,
            cursor: busy ? 'default' : 'pointer',
          }}
          onClick={() => {
            if (busy) return;
            onClose();
          }}
        >
          <Box
            sx={{
              width: 62,
              height: 6,
              borderRadius: 999,
              backgroundColor: 'rgba(31, 43, 54, 0.2)',
            }}
          />
        </Box>

        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            gap: 1.25,
            mb: 1,
          }}
        >
          <Box
            sx={{
              width: 44,
              height: 44,
              flexShrink: 0,
              borderRadius: '12px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              backgroundColor: `${config.confirmColor}1A`,
              color: config.confirmColor,
              '& .MuiSvgIcon-root': {
                fontSize: 24,
              },
            }}
          >
            {config.icon}
          </Box>
          <Typography
            component="h2"
            sx={{
              fontSize: titleFontSize,
              fontWeight: 700,
              lineHeight: 1.2,
              color: appPalette.text,
            }}
          >
            {config.title}
          </Typography>
        </Box>

        <Typography
          sx={{
            fontSize: bodyFontSize,
            lineHeight: 1.45,
            color: appPalette.textMuted,
            mb: 2.5,
          }}
        >
          {config.message}
        </Typography>

        <Box sx={{ display: 'flex', gap: 1, mb: 1 }}>
          <Button
            fullWidth
            disableElevation
            variant="contained"
            disabled={busy}
            onClick={onClose}
            sx={{
              height: ORDER_CARD_BUTTON_HEIGHT,
              minHeight: ORDER_CARD_BUTTON_HEIGHT,
              borderRadius: '12px',
              textTransform: 'none',
              fontWeight: 700,
              fontSize: actionFontSize,
              backgroundColor: appPalette.surfaceAlt,
              color: appPalette.text,
              boxShadow: 'none',
              '&:hover': {
                backgroundColor: appPalette.soft,
                boxShadow: 'none',
              },
            }}
          >
            Нет
          </Button>
          <Button
            fullWidth
            disableElevation
            variant="contained"
            disabled={busy}
            autoFocus
            aria-label={config.confirmText}
            onClick={() => {
              if (busy) return;
              onConfirm();
            }}
            sx={{
              height: ORDER_CARD_BUTTON_HEIGHT,
              minHeight: ORDER_CARD_BUTTON_HEIGHT,
              borderRadius: '12px',
              textTransform: 'none',
              fontWeight: 700,
              fontSize: actionFontSize,
              backgroundColor: config.confirmColor,
              color: '#fff',
              boxShadow: 'none',
              '&:hover': {
                backgroundColor: config.confirmColor,
                filter: 'brightness(0.94)',
                boxShadow: 'none',
              },
            }}
          >
            {busy ? <CircularProgress size={18} sx={{ color: '#fff' }} /> : config.confirmText}
          </Button>
        </Box>
      </Box>
    </SwipeableDrawer>
  );
};
