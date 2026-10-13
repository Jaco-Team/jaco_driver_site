import AutoAwesomeRoundedIcon from '@mui/icons-material/AutoAwesomeRounded';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import SwipeableDrawer from '@mui/material/SwipeableDrawer';
import Typography from '@mui/material/Typography';

import { useHeaderStore } from '@/features/header/model/header.store';
import { appDarkPalette, appPalette } from '@/shared/styles/appPalette';

interface NoSuitableOrdersDrawerProps {
  open: boolean;
  onClose: () => void;
}

function clamp(value: number, min: number, max: number) {
  return Math.min(Math.max(value, min), max);
}

export function NoSuitableOrdersDrawer({ open, onClose }: NoSuitableOrdersDrawerProps) {
  const globalFontSize = useHeaderStore((state) => state.globalFontSize);

  return (
    <SwipeableDrawer
      anchor="bottom"
      open={open}
      onClose={onClose}
      onOpen={() => {}}
      disableSwipeToOpen
      data-testid="order-recommendation-empty-drawer"
      slotProps={{
        paper: {
          sx: {
            borderTopLeftRadius: 28,
            borderTopRightRadius: 28,
            height: 'auto',
            maxHeight: '75dvh',
            overflow: 'hidden',
            backgroundColor: (theme) =>
              theme.palette.mode === 'dark' ? appDarkPalette.aiSurface : appPalette.aiSurface,
            backgroundImage: 'none',
            border: '1px solid',
            borderColor: 'divider',
            boxShadow: (theme) =>
              theme.palette.mode === 'dark'
                ? `0 -20px 44px ${appDarkPalette.shadow}`
                : '0 -20px 44px rgba(31, 43, 54, 0.18)',
          },
        },
      }}
    >
      <Box sx={{ px: 2.5, pt: 1.15, pb: 'calc(env(safe-area-inset-bottom, 0px) + 28px)' }}>
        <Box
          component="button"
          type="button"
          aria-label="Закрыть рекомендации"
          onClick={onClose}
          sx={{
            width: '100%',
            display: 'flex',
            justifyContent: 'center',
            pb: 1.5,
            border: 0,
            backgroundColor: 'transparent',
            cursor: 'pointer',
          }}
        >
          <Box
            sx={{
              width: 56,
              height: 6,
              borderRadius: 999,
              backgroundColor: 'divider',
            }}
          />
        </Box>

        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.25, mb: 2 }}>
          <Box
            sx={{
              width: 44,
              height: 44,
              flexShrink: 0,
              display: 'grid',
              placeItems: 'center',
              borderRadius: '13px',
              color: 'primary.main',
              backgroundColor: (theme) =>
                theme.palette.mode === 'dark' ? appDarkPalette.brandSoft : appPalette.brandSoft,
            }}
          >
            <AutoAwesomeRoundedIcon />
          </Box>
          <Typography
            component="h2"
            sx={{
              fontSize: clamp(globalFontSize + 4, 18, 24),
              fontWeight: 750,
              lineHeight: 1.2,
            }}
          >
            Рекомендации по заказам
          </Typography>
        </Box>

        <Typography
          data-testid="order-recommendation-empty-message"
          sx={{
            mb: 2.5,
            color: 'text.secondary',
            fontSize: clamp(globalFontSize, 14, 19),
            lineHeight: 1.45,
          }}
        >
          Подходящих заказов для Вас сейчас нет.
        </Typography>

        <Button
          fullWidth
          disableElevation
          variant="contained"
          onClick={onClose}
          sx={{
            height: 48,
            borderRadius: '13px',
            fontSize: clamp(globalFontSize, 14, 19),
            fontWeight: 700,
            textTransform: 'none',
          }}
        >
          Понятно
        </Button>
      </Box>
    </SwipeableDrawer>
  );
}
