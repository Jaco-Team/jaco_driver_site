import React from 'react';
import Box from '@mui/material/Box';
import Divider from '@mui/material/Divider';
import IconButton from '@mui/material/IconButton';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemText from '@mui/material/ListItemText';
import SwipeableDrawer from '@mui/material/SwipeableDrawer';
import Typography from '@mui/material/Typography';
import CloseIcon from '@mui/icons-material/Close';
import { styled } from '@mui/material/styles';

import { useOrdersStore } from '@/entities/order/model/order.store';
import { appPalette } from '@/shared/styles/appPalette';

const HeaderBox = styled(Box)({
  position: 'sticky',
  top: 0,
  zIndex: 1,
  backgroundColor: '#fff',
});

const TitleText = styled(Typography)({
  fontWeight: 600,
  textAlign: 'center',
  color: '#333',
});

const StyledListItemButton = styled(ListItemButton)(({ theme }) => ({
  padding: theme.spacing(2, 3),
  margin: theme.spacing(0.5, 2),
  backgroundColor: '#fff',
  borderRadius: 12,
  justifyContent: 'center',
  textAlign: 'center',
  boxShadow: '0 1px 3px rgba(0, 0, 0, 0.08)',
  transition: 'all 0.2s ease',
  '&:hover': {
    backgroundColor: '#fff',
    opacity: 0.9,
  },
  '&:active': {
    backgroundColor: '#f0f0f0',
  },
}));

const ActiveBadge = styled(Box)({
  position: 'absolute',
  right: 16,
  width: 8,
  height: 8,
  borderRadius: '50%',
  backgroundColor: '#4caf50',
});

interface OrderStatusModalProps {
  open: boolean;
  onClose: () => void;
  globalFontSize: number;
}

export const OrderStatusModal: React.FC<OrderStatusModalProps> = ({
  open,
  onClose,
  globalFontSize,
}) => {
  const { type, setType, types } = useOrdersStore((state: any) => ({
    type: state.type,
    setType: state.setType,
    types: state.types,
  }));

  const handleStatusClick = (selectedType: any) => {
    setType(selectedType);
    onClose();
  };

  return (
    <SwipeableDrawer
      anchor="bottom"
      open={open}
      onClose={onClose}
      onOpen={() => {}}
      disableSwipeToOpen
      transitionDuration={300}
      data-testid="order-status-modal"
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
          },
        },
      }}
    >
      <Box
        sx={{
          px: 0,
          pt: 1.15,
          pb: 'calc(env(safe-area-inset-bottom, 0px) + 28px)',
        }}
      >
        <HeaderBox>
          <Box
            sx={{
              width: '100%',
              display: 'flex',
              justifyContent: 'center',
              pb: 1,
              cursor: 'pointer',
            }}
            onClick={onClose}
            data-testid="order-status-modal-handle"
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

          <Box sx={{ position: 'relative', px: 3, pb: 1 }}>
            <IconButton
              onClick={onClose}
              size="small"
              aria-label="Закрыть"
              sx={{
                position: 'absolute',
                top: 0,
                right: 12,
                width: 44,
                height: 44,
              }}
            >
              <CloseIcon />
            </IconButton>
            <TitleText variant="h6" style={{ fontSize: globalFontSize + 2, lineHeight: 1.2 }}>
              Список заказов
            </TitleText>
          </Box>
          <Divider sx={{ mt: 1 }} />
        </HeaderBox>

        <List sx={{ p: 0, pt: 1 }}>
          {types.map((orderType: any) => (
            <ListItem key={orderType.id} sx={{ p: 0, position: 'relative' }}>
              <StyledListItemButton
                onClick={() => handleStatusClick(orderType)}
                sx={{
                  backgroundColor: type?.id === orderType.id ? '#e3f2fd' : '#fff',
                  position: 'relative',
                }}
              >
                <ListItemText
                  primary={orderType.text}
                  slotProps={{
                    primary: {
                      sx: {
                        fontSize: globalFontSize,
                        fontWeight: type?.id === orderType.id ? 600 : 500,
                        textAlign: 'center',
                        color: type?.id === orderType.id ? '#1976d2' : '#333',
                      },
                    },
                  }}
                />
                {type?.id === orderType.id && <ActiveBadge />}
              </StyledListItemButton>
            </ListItem>
          ))}
        </List>
      </Box>
    </SwipeableDrawer>
  );
};
