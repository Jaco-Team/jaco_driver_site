import { Box, Typography, styled } from '@mui/material';
import ScheduleRoundedIcon from '@mui/icons-material/ScheduleRounded';
import SyncRoundedIcon from '@mui/icons-material/SyncRounded';

import { normalizeGlobalFontSize } from '@/shared/lib/fontSize';
import { appDarkPalette, appPalette } from '@/shared/styles/appPalette';

interface FinishStatusProps {
  globalFontSize: number;
  acknowledged?: boolean;
}

const StatusBlock = styled(Box)(({ theme }) => {
  const palette = theme.palette.mode === 'dark' ? appDarkPalette : appPalette;
  return {
    marginTop: 4,
    padding: 12,
    minWidth: 0,
    minHeight: 56,
    boxSizing: 'border-box',
    borderRadius: 12,
    border: `1px solid ${palette.border}`,
    backgroundColor: palette.surfaceAlt,
    color: palette.text,
    '& .finishStatusRow': { display: 'flex', alignItems: 'center', gap: 10, minWidth: 0 },
    '& .finishStatusIcon': { flexShrink: 0, color: palette.primary },
    '& .finishStatusMessage': {
      minWidth: 0,
      flex: 1,
      overflowWrap: 'anywhere',
      whiteSpace: 'pre-line',
      fontWeight: 400,
    },
  };
});

export function FinishStatus({ globalFontSize, acknowledged }: FinishStatusProps) {
  const fontSize = normalizeGlobalFontSize(globalFontSize);
  const Icon = acknowledged ? SyncRoundedIcon : ScheduleRoundedIcon;
  return (
    <StatusBlock role="status" data-testid="order-finish-pending">
      <Box className="finishStatusRow">
        <Icon
          className="finishStatusIcon"
          aria-hidden="true"
          sx={{ fontSize: Math.max(18, Math.min(fontSize + 2, 26)) }}
        />
        <Typography
          className="finishStatusMessage"
          sx={{ fontSize, lineHeight: `${fontSize + 6}px` }}
        >
          {acknowledged
            ? 'Завершение отправлено.\nОбновляем статус.'
            : 'Завершение сохранено.\nОжидает отправки.'}
        </Typography>
      </Box>
    </StatusBlock>
  );
}
