import React from 'react';
import {
  Box,
  Typography,
  List,
  ListItem,
  ListItemButton,
  ListItemText,
  Drawer,
  Divider,
  IconButton,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import { styled } from '@mui/material/styles';
import { useOrdersStore } from '@/entities/order/model/order.store';
import { useSettingsStore } from '@/entities/settings';

const StyledDrawer = styled(Drawer)(({ theme }) => ({
  '& .MuiDrawer-paper': {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    top: 'auto',
    backgroundColor: '#f5f5f5',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    outline: 'none',
    maxHeight: '70vh',
    overflow: 'auto',
  },
}));

const HeaderBox = styled(Box)(({ theme }) => ({
  padding: theme.spacing(2, 3),
  backgroundColor: '#f5f5f5',
  borderTopLeftRadius: 20,
  borderTopRightRadius: 20,
  position: 'sticky',
  top: 0,
  zIndex: 1,
}));

const TitleText = styled(Typography)(({ theme }) => ({
  fontWeight: 600,
  textAlign: 'center',
  color: '#333',
}));

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

const ActiveBadge = styled(Box)(({ theme }) => ({
  position: 'absolute',
  right: 16,
  width: 8,
  height: 8,
  borderRadius: '50%',
  backgroundColor: '#4caf50',
}));

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
    <StyledDrawer anchor="bottom" open={open} onClose={onClose} transitionDuration={300}>
      <HeaderBox>
        <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 1 }}>
          <IconButton onClick={onClose} size="small" sx={{ p: 0.5 }}>
            <CloseIcon />
          </IconButton>
        </Box>
        <TitleText variant="h6" style={{ fontSize: globalFontSize + 2 }}>
          Список заказов
        </TitleText>
        <Divider sx={{ mt: 2 }} />
      </HeaderBox>

      <List sx={{ p: 0, pb: 4 }}>
        {types.map((orderType: any, index: number) => (
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
                primaryTypographyProps={{
                  fontSize: globalFontSize,
                  fontWeight: type?.id === orderType.id ? 600 : 500,
                  textAlign: 'center',
                  color: type?.id === orderType.id ? '#1976d2' : '#333',
                }}
              />
              {type?.id === orderType.id && <ActiveBadge />}
            </StyledListItemButton>
          </ListItem>
        ))}
      </List>
    </StyledDrawer>
  );
};
