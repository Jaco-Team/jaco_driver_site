import React from 'react';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import SwipeableDrawer from '@mui/material/SwipeableDrawer';
import Typography from '@mui/material/Typography';
import CheckRoundedIcon from '@mui/icons-material/CheckRounded';

import { log } from '@/components/analytics';
import { useHeaderStore } from '@/features/header/model/header.store';
import { useOrdersStore } from '@/entities/order/model/order.store';
import { appDarkPalette, appPalette } from '@/shared/styles/appPalette';
import { ORDER_CARD_BUTTON_HEIGHT } from '@/widgets/order/ui/components/OrderCard';

function clampFontSize(value: number, min: number, max: number) {
  return Math.min(Math.max(value, min), max);
}

export function OrdersFilterSheet() {
  const globalFontSize = useHeaderStore((state) => state.globalFontSize);
  const { types_dop, type_dop, is_showModalTypeDop, showModalTypeDop, setTypeDop } = useOrdersStore(
    (state) => ({
      types_dop: state.types_dop,
      type_dop: state.type_dop,
      is_showModalTypeDop: state.is_showModalTypeDop,
      showModalTypeDop: state.showModalTypeDop,
      setTypeDop: state.setTypeDop,
    })
  );

  const titleFontSize = clampFontSize(globalFontSize + 4, 18, 24);
  const helperFontSize = clampFontSize(globalFontSize - 1, 13, 16);
  const actionFontSize = clampFontSize(globalFontSize + 1, 14, 18);

  const handleClose = () => showModalTypeDop(false);

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
        <Typography
          sx={{
            fontSize: helperFontSize,
            lineHeight: 1.4,
            color: 'text.secondary',
            mb: 2,
          }}
        >
          Какие статусы показывать
        </Typography>

        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
          {types_dop.map((item) => {
            const value = item.id.toString();
            const selected = type_dop.includes(value);

            return (
              <Button
                key={item.id}
                fullWidth
                disableElevation
                variant="contained"
                onClick={() => handleToggle(value)}
                aria-pressed={selected}
                sx={{
                  height: ORDER_CARD_BUTTON_HEIGHT,
                  minHeight: ORDER_CARD_BUTTON_HEIGHT,
                  borderRadius: '12px',
                  textTransform: 'none',
                  fontWeight: 700,
                  fontSize: actionFontSize,
                  justifyContent: 'space-between',
                  px: 2,
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
                {item.text}
                {selected ? <CheckRoundedIcon sx={{ fontSize: 20 }} /> : <Box sx={{ width: 20 }} />}
              </Button>
            );
          })}
        </Box>
      </Box>
    </SwipeableDrawer>
  );
}
