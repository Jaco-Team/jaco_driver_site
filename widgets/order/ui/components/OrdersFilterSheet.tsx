import React from 'react';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import IconButton from '@mui/material/IconButton';
import SvgIcon from '@mui/material/SvgIcon';
import SwipeableDrawer from '@mui/material/SwipeableDrawer';
import Tooltip from '@mui/material/Tooltip';
import Typography from '@mui/material/Typography';
import CheckRoundedIcon from '@mui/icons-material/CheckRounded';

import { log } from '@/components/analytics';
import { useHeaderStore } from '@/features/header/model/header.store';
import { useOrdersStore } from '@/entities/order/model/order.store';
import { appDarkPalette, appPalette } from '@/shared/styles/appPalette';
import { ORDER_CARD_BUTTON_HEIGHT } from '@/widgets/order/ui/components/OrderCard';
import { scaleGlobalFontSize } from '@/shared/lib/fontSize';

export function OrdersFilterSheet() {
  const globalFontSize = useHeaderStore((state) => state.globalFontSize);
  const {
    types_dop,
    type_dop,
    sourceOrders,
    typeToStatus,
    is_showModalTypeDop,
    showModalTypeDop,
    setTypeDop,
  } = useOrdersStore((state) => ({
    types_dop: state.types_dop,
    type_dop: state.type_dop,
    sourceOrders: state.sourceOrders,
    typeToStatus: state.typeToStatus,
    is_showModalTypeDop: state.is_showModalTypeDop,
    showModalTypeDop: state.showModalTypeDop,
    setTypeDop: state.setTypeDop,
  }));

  const titleFontSize = scaleGlobalFontSize(20, globalFontSize, 18, 24);
  const helperFontSize = scaleGlobalFontSize(15, globalFontSize, 13, 18);
  const actionFontSize = scaleGlobalFontSize(17, globalFontSize, 14, 22);

  const handleClose = () => showModalTypeDop(false);
  const isFilterActive = type_dop.length < types_dop.length;

  const handleReset = () => {
    log('order_select', 'Сброс фильтра статусов');
    setTypeDop(types_dop.map((status) => String(status.id)));
  };

  const handleToggle = (value: string) => {
    log('order_select', 'Выбор типа заказа');

    setTypeDop(
      type_dop.includes(value) ? type_dop.filter((item) => item !== value) : [...type_dop, value]
    );
  };

  return (
    <SwipeableDrawer
      anchor="bottom"
      open={is_showModalTypeDop}
      onClose={handleClose}
      onOpen={() => {}}
      disableSwipeToOpen
      data-testid="orders-filter-sheet"
      slotProps={{
        paper: {
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
          px: 2.5,
          pt: 1.15,
          pb: 'calc(env(safe-area-inset-bottom, 0px) + 28px)',
          minHeight: 0,
          overflowY: 'auto',
        }}
      >
        <Box
          sx={{
            width: '100%',
            display: 'flex',
            justifyContent: 'center',
            pb: 1.5,
            cursor: 'pointer',
          }}
          onClick={handleClose}
          data-testid="orders-filter-sheet-handle"
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

        <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1, mb: 2 }}>
          <Box sx={{ flex: 1, minWidth: 0 }}>
            <Typography
              component="h2"
              sx={{
                fontSize: titleFontSize,
                fontWeight: 700,
                lineHeight: 1.2,
                color: 'text.primary',
                mb: 0.5,
              }}
            >
              Активные заказы
            </Typography>
            <Typography sx={{ fontSize: helperFontSize, lineHeight: 1.4, color: 'text.secondary' }}>
              Какие статусы показывать
            </Typography>
          </Box>
          <Box sx={{ width: 44, flexShrink: 0, mt: -1 }}>
            {isFilterActive && (
              <Tooltip title="Сбросить фильтр">
                <IconButton
                  aria-label="Сбросить фильтр"
                  onClick={handleReset}
                  sx={{
                    width: 44,
                    height: 44,
                    color: 'text.secondary',
                    '&:hover': { color: 'text.primary', backgroundColor: 'action.hover' },
                  }}
                >
                  <SvgIcon sx={{ fontSize: 24 }}>
                    <g
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d="M3 4h11M3 4l7 9v7l4 2v-9l2-2" />
                      <path d="m17 3 5 5m0-5-5 5" />
                    </g>
                  </SvgIcon>
                </IconButton>
              </Tooltip>
            )}
          </Box>
        </Box>

        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
          {types_dop.map((item) => {
            const value = item.id.toString();
            const selected = type_dop.includes(value);
            const count = sourceOrders.filter(
              (order) => order.status === typeToStatus[item.id]
            ).length;

            return (
              <Button
                key={item.id}
                fullWidth
                disableElevation
                variant="contained"
                onClick={() => handleToggle(value)}
                aria-pressed={selected}
                sx={{
                  minHeight: ORDER_CARD_BUTTON_HEIGHT,
                  borderRadius: '12px',
                  textTransform: 'none',
                  fontWeight: 700,
                  fontSize: actionFontSize,
                  lineHeight: 1.25,
                  justifyContent: 'space-between',
                  px: 2,
                  py: 1.25,
                  backgroundColor: (theme) =>
                    selected
                      ? `${theme.palette.primary.main} !important`
                      : theme.palette.mode === 'dark'
                        ? appDarkPalette.surfaceAlt
                        : appPalette.surfaceAlt,
                  color: (theme) =>
                    selected ? theme.palette.primary.contrastText : theme.palette.text.primary,
                  boxShadow: 'none',
                  '&:hover': {
                    backgroundColor: (theme) =>
                      selected
                        ? `${theme.palette.primary.main} !important`
                        : theme.palette.mode === 'dark'
                          ? appDarkPalette.surfaceRaised
                          : appPalette.soft,
                    boxShadow: 'none',
                  },
                  '&:active': {
                    backgroundColor: (theme) =>
                      selected
                        ? `${theme.palette.primary.dark} !important`
                        : theme.palette.mode === 'dark'
                          ? appDarkPalette.surfaceRaised
                          : appPalette.soft,
                  },
                }}
              >
                <Box component="span" sx={{ minWidth: 0, textAlign: 'left' }}>
                  {item.text}
                </Box>
                <Box
                  component="span"
                  sx={{ display: 'flex', alignItems: 'center', gap: 1.5, ml: 1.5, flexShrink: 0 }}
                >
                  <Box component="span" sx={{ fontVariantNumeric: 'tabular-nums' }}>
                    {count}
                  </Box>
                  {selected ? (
                    <CheckRoundedIcon sx={{ fontSize: 20 }} />
                  ) : (
                    <Box sx={{ width: 20 }} />
                  )}
                </Box>
              </Button>
            );
          })}
        </Box>
        <Button
          fullWidth
          variant="outlined"
          onClick={handleClose}
          sx={{
            mt: 2,
            minHeight: ORDER_CARD_BUTTON_HEIGHT,
            borderRadius: '12px',
            textTransform: 'none',
            fontSize: actionFontSize,
            fontWeight: 700,
            color: 'text.primary',
            borderColor: 'divider',
            backgroundColor: (theme) => (theme.palette.mode === 'light' ? '#E0E0E0' : undefined),
            '&:hover, &:active': {
              backgroundColor: (theme) => (theme.palette.mode === 'light' ? '#E0E0E0' : undefined),
            },
          }}
        >
          Готово
        </Button>
      </Box>
    </SwipeableDrawer>
  );
}
