import React, { useState } from 'react';
import SwipeableDrawer from '@mui/material/SwipeableDrawer';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import ErrorOutlinedIcon from '@mui/icons-material/ErrorOutlined';
import WifiOffIcon from '@mui/icons-material/WifiOff';

import { useHeaderStore } from '@/features/header/model/header.store';
import { appDarkPalette, appPalette } from '@/shared/styles/appPalette';

interface ErrorModalProps {
  open: boolean;
  errorText: string;
  onClose: () => void;
}

export const ErrorModal: React.FC<ErrorModalProps> = ({ open, errorText, onClose }) => {
  const globalFontSize = useHeaderStore((state) => state.globalFontSize);
  const isDark = useHeaderStore((state) => state.darkTheme);
  const [lastOpenText, setLastOpenText] = useState(errorText);
  if (open && errorText && errorText !== lastOpenText) {
    setLastOpenText(errorText);
  }
  const message = (open ? errorText : lastOpenText) || 'Произошла неизвестная ошибка';
  const isOffline = message.startsWith('Нет интернета.');
  const body = isOffline ? message.slice('Нет интернета.'.length).trim() : message;
  const brand = isDark ? appDarkPalette.brand : appPalette.brand;
  const titleFontSize = Math.min(Math.max(globalFontSize + 4, 18), 24);
  const bodyFontSize = Math.min(Math.max(globalFontSize, 14), 18);
  const actionFontSize = Math.min(Math.max(globalFontSize + 1, 14), 18);

  return (
    <SwipeableDrawer
      anchor="bottom"
      open={open}
      onClose={onClose}
      onOpen={() => {}}
      disableSwipeToOpen
      data-testid="error-modal"
      sx={{ zIndex: (theme) => theme.zIndex.modal + 3 }}
      slotProps={{
        paper: {
          sx: {
            borderTopLeftRadius: 28,
            borderTopRightRadius: 28,
            maxHeight: '75vh',
            height: 'auto',
            bottom: 0,
            top: 'auto',
            backgroundColor: isDark ? appDarkPalette.surface : '#FFFFFF',
            backgroundImage: 'none',
            overflow: 'hidden',
            border: '1px solid',
            borderColor: isDark ? appDarkPalette.border : appPalette.softStrong,
            boxShadow: isDark
              ? `0 24px 44px ${appDarkPalette.shadowStrong}`
              : '0 24px 44px rgba(31, 43, 54, 0.2)',
          },
        },
      }}
    >
      <Box sx={{ px: 2.5, pt: 1.15, pb: 'calc(env(safe-area-inset-bottom, 0px) + 28px)' }}>
        <Box
          component="button"
          type="button"
          sx={{
            width: '100%',
            display: 'flex',
            justifyContent: 'center',
            pb: 1.5,
            border: 0,
            backgroundColor: 'transparent',
            cursor: 'pointer',
          }}
          onClick={onClose}
          aria-label="Закрыть сообщение"
        >
          <Box
            sx={{
              width: 62,
              height: 6,
              borderRadius: 999,
              backgroundColor: isDark ? appDarkPalette.border : appPalette.border,
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
              backgroundColor: isDark ? appDarkPalette.brandSoft : appPalette.brandSoft,
              color: brand,
              '& .MuiSvgIcon-root': { fontSize: 24 },
            }}
          >
            {isOffline ? <WifiOffIcon /> : <ErrorOutlinedIcon />}
          </Box>
          <Typography
            component="h2"
            sx={{
              fontSize: titleFontSize,
              fontWeight: 700,
              lineHeight: 1.2,
              color: 'text.primary',
            }}
          >
            {isOffline ? 'Нет интернета' : 'Внимание'}
          </Typography>
        </Box>
        <Typography
          sx={{
            fontSize: bodyFontSize,
            lineHeight: 1.45,
            color: 'text.secondary',
            whiteSpace: 'pre-line',
            mb: 2.5,
            maxHeight: 'calc(75vh - 180px)',
            overflowY: 'auto',
          }}
        >
          {body}
        </Typography>
        <Button
          fullWidth
          disableElevation
          onClick={onClose}
          variant="contained"
          sx={{
            height: 44,
            minHeight: 44,
            borderRadius: '12px',
            backgroundColor: brand,
            color: '#FFFFFF',
            fontSize: actionFontSize,
            fontWeight: 700,
            textTransform: 'none',
            '&:hover': { backgroundColor: brand },
          }}
        >
          Понятно
        </Button>
      </Box>
    </SwipeableDrawer>
  );
};
