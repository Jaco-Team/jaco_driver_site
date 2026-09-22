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
import {
  appDarkPalette,
  appDarkSuccessPalette,
  appPalette,
  appSuccessPalette,
} from '@/shared/styles/appPalette';

const SELECTED_TYPE_BG_LIGHT = '#e3f2fd';
const SELECTED_TYPE_TEXT_LIGHT = '#1976d2';
const SELECTED_TYPE_BG_DARK = 'rgba(117, 147, 173, 0.18)';
const SELECTED_TYPE_TEXT_DARK = '#9CC0DD';

const HeaderBox = styled(Box)(({ theme }) => ({
  position: 'sticky',
  top: 0,
  zIndex: 1,
  backgroundColor: theme.palette.background.paper,
}));

const TitleText = styled(Typography)(({ theme }) => ({
  fontWeight: 600,
  textAlign: 'center',
  color: theme.palette.mode === 'dark' ? theme.palette.text.primary : '#333',
}));

const StyledListItemButton = styled(ListItemButton)(({ theme }) => {
  const isDark = theme.palette.mode === 'dark';

  return {
    padding: theme.spacing(2, 3),
    margin: theme.spacing(0.5, 2),
    backgroundColor: isDark ? appDarkPalette.surfaceAlt : '#fff',
    borderRadius: 12,
    justifyContent: 'center',
    textAlign: 'center',
    boxShadow: isDark ? `0 1px 3px ${appDarkPalette.shadowSoft}` : '0 1px 3px rgba(0, 0, 0, 0.08)',
    transition: 'all 0.2s ease',
    '&:hover': {
      backgroundColor: isDark ? appDarkPalette.surfaceRaised : '#fff',
      opacity: 0.9,
    },
    '&:active': {
      backgroundColor: isDark ? appDarkPalette.surfaceRaised : '#f0f0f0',
    },
  };
});

const ActiveBadge = styled(Box)(({ theme }) => ({
  position: 'absolute',
  right: 16,
  width: 8,
  height: 8,
  borderRadius: '50%',
  backgroundColor:
    theme.palette.mode === 'dark' ? appDarkSuccessPalette.main : appSuccessPalette.main,
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
          className: 'orderStatusSheet',
          sx: {
            borderTopLeftRadius: 28,
            borderTopRightRadius: 28,
            maxHeight: '75vh',
            height: 'auto',
            bottom: 0,
            top: 'auto',
            backgroundColor: 'background.paper',
            overflow: 'hidden',
            border: '1px solid',
            borderColor: (theme) =>
              theme.palette.mode === 'dark' ? theme.palette.divider : appPalette.softStrong,
            boxShadow: (theme) =>
              theme.palette.mode === 'dark'
                ? `0 24px 44px ${appDarkPalette.shadow}`
                : '0 24px 44px rgba(31, 43, 54, 0.2)',
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
                backgroundColor: (theme) =>
                  theme.palette.mode === 'dark'
                    ? 'rgba(217, 224, 230, 0.28)'
                    : 'rgba(31, 43, 54, 0.2)',
              }}
            />
          </Box>

          <Box sx={{ position: 'relative', px: 3, pb: 1, backgroundColor: (theme) => {
                    const isDark = theme.palette.mode === 'dark';
                    return isDark ? appDarkPalette.surface : '#fff';
                  }, }}>
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
                  backgroundColor: (theme) => {
                    const isDark = theme.palette.mode === 'dark';

                    if (type?.id === orderType.id) {
                      return isDark ? SELECTED_TYPE_BG_DARK : SELECTED_TYPE_BG_LIGHT;
                    }

                    return isDark ? appDarkPalette.surface : '#fff';
                  },
                  position: 'relative',
                }}
              >
                <ListItemText
                  primary={orderType.text}
                  slotProps={{
                    primary: {
                      // Doubled selector so the global `.MuiDrawer-paper li span` rule
                      // does not win over the per-item typography.
                      sx: {
                        '&&': {
                          fontSize: globalFontSize,
                          fontWeight: type?.id === orderType.id ? 600 : 500,
                          textAlign: 'center',
                          color: (theme) => {
                            const isDark = theme.palette.mode === 'dark';

                            if (type?.id === orderType.id) {
                              return isDark ? SELECTED_TYPE_TEXT_DARK : SELECTED_TYPE_TEXT_LIGHT;
                            }

                            return isDark ? theme.palette.text.primary : '#333';
                          },
                        },
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
