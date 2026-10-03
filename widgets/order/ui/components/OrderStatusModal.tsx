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
import { appDarkPalette, appPalette, appSuccessPalette } from '@/shared/styles/appPalette';

const SELECTED_TYPE_BG_LIGHT = appPalette.surfaceAlt;
const SELECTED_TYPE_TEXT_LIGHT = appPalette.text;
const SELECTED_TYPE_BG_DARK = appDarkPalette.surfaceAlt;
const SELECTED_TYPE_TEXT_DARK = appDarkPalette.text;

const HeaderBox = styled(Box)(({ theme }) => ({
  position: 'sticky',
  top: 0,
  zIndex: 1,
  backgroundColor: theme.palette.mode === 'dark' ? appDarkPalette.surface : '#FFFFFF',
}));

const TitleText = styled(Typography)(({ theme }) => ({
  fontWeight: 500,
  textAlign: 'center',
  color: theme.palette.mode === 'dark' ? theme.palette.text.primary : '#333',
}));

const StyledListItemButton = styled(ListItemButton)(({ theme }) => {
  const isDark = theme.palette.mode === 'dark';

  return {
    minHeight: 56,
    padding: theme.spacing(0, 3),
    backgroundColor: isDark ? appDarkPalette.surface : '#FFFFFF',
    border: `1px solid ${isDark ? appDarkPalette.border : appPalette.border}`,
    borderRadius: 12,
    justifyContent: 'center',
    textAlign: 'center',
    boxShadow: `0 1px 3px ${isDark ? appDarkPalette.shadowSoft : appPalette.shadowSoft}`,
    transition: 'all 0.2s ease',
    '&:hover': {
      backgroundColor: isDark ? appDarkPalette.surfaceRaised : '#FFFFFF',
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
  backgroundColor: appSuccessPalette.main,
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
            backgroundColor: (theme) =>
              theme.palette.mode === 'dark' ? appDarkPalette.surface : '#FFFFFF',
            backgroundImage: 'none',
            overflow: 'hidden',
            border: '1px solid',
            borderColor: (theme) =>
              theme.palette.mode === 'dark' ? appDarkPalette.border : appPalette.softStrong,
            boxShadow: (theme) =>
              `0 -18px 42px ${theme.palette.mode === 'dark' ? appDarkPalette.shadowStrong : appPalette.shadowStrong}`,
          },
        },
      }}
    >
      <Box
        sx={{
          px: 0,
          pt: 0,
        }}
      >
        <HeaderBox>
          <Box
            sx={{
              width: '100%',
              display: 'flex',
              justifyContent: 'center',
              height: 22,
              alignItems: 'center',
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
                  theme.palette.mode === 'dark' ? appDarkPalette.border : appPalette.softStrong,
              }}
            />
          </Box>

          <Box
            sx={{
              minHeight: 46,
              display: 'grid',
              gridTemplateColumns: '44px 1fr 44px',
              alignItems: 'center',
              px: 1.5,
              pb: 1,
              backgroundColor: (theme) => {
                const isDark = theme.palette.mode === 'dark';
                return isDark ? appDarkPalette.surface : '#fff';
              },
            }}
          >
            <Box />
            <TitleText variant="h6" style={{ fontSize: globalFontSize + 2, lineHeight: 1.35 }}>
              Список заказов
            </TitleText>
            <IconButton
              onClick={onClose}
              aria-label="Закрыть"
              sx={{
                width: 44,
                height: 44,
                color: 'text.secondary',
              }}
            >
              <CloseIcon />
            </IconButton>
          </Box>
          <Divider />
        </HeaderBox>

        <List
          disablePadding
          sx={{
            display: 'flex',
            flexDirection: 'column',
            gap: 1,
            px: 2,
            pt: 1.5,
            pb: 'calc(env(safe-area-inset-bottom, 0px) + 28px)',
          }}
        >
          {types.map((orderType: any) => (
            <ListItem disablePadding key={orderType.id}>
              <StyledListItemButton
                selected={type?.id === orderType.id}
                onClick={() => handleStatusClick(orderType)}
                sx={{
                  borderColor: (theme) =>
                    type?.id === orderType.id
                      ? theme.palette.mode === 'dark'
                        ? appDarkPalette.primary
                        : appPalette.primary
                      : theme.palette.mode === 'dark'
                        ? appDarkPalette.border
                        : appPalette.border,
                  backgroundColor: (theme) => {
                    const isDark = theme.palette.mode === 'dark';

                    if (type?.id === orderType.id) {
                      return isDark ? SELECTED_TYPE_BG_DARK : SELECTED_TYPE_BG_LIGHT;
                    }

                    return isDark ? appDarkPalette.surface : '#FFFFFF';
                  },
                  '&&.Mui-selected, &&.Mui-selected:hover': {
                    backgroundColor: (theme) =>
                      theme.palette.mode === 'dark'
                        ? SELECTED_TYPE_BG_DARK
                        : SELECTED_TYPE_BG_LIGHT,
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
                          fontWeight: 500,
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
