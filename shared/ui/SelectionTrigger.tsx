import KeyboardArrowDownRoundedIcon from '@mui/icons-material/KeyboardArrowDownRounded';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import { forwardRef } from 'react';

import { appPalette } from '@/shared/styles/appPalette';

interface SelectionTriggerProps {
  value?: string | null;
  placeholder?: string;
  fontSize?: number;
  onClick: () => void;
  fullWidth?: boolean;
  active?: boolean;
}

const SelectionTrigger = forwardRef<HTMLButtonElement, SelectionTriggerProps>(
  function SelectionTrigger(
    {
      value,
      placeholder = 'Выберите значение',
      fontSize = 16,
      onClick,
      fullWidth = false,
      active = false,
    },
    ref
  ) {
    const resolvedValue = value?.trim() || placeholder;
    const isPlaceholder = !value?.trim();

    return (
      <Button
        ref={ref}
        variant="outlined"
        fullWidth={fullWidth}
        onClick={onClick}
        endIcon={<KeyboardArrowDownRoundedIcon />}
        sx={{
          justifyContent: 'space-between',
          width: fullWidth ? '100%' : 'auto',
          minHeight: 54,
          px: 1.75,
          py: 1,
          borderRadius: 3.5,
          borderColor: active ? appPalette.primary : appPalette.softStrong,
          backgroundColor: active ? appPalette.softHover : '#fff',
          color: isPlaceholder ? appPalette.textMuted : appPalette.primaryDeep,
          textTransform: 'none',
          boxShadow: active
            ? '0 16px 32px rgba(15, 23, 42, 0.10)'
            : '0 12px 28px rgba(15, 23, 42, 0.06)',
          '&:hover': {
            borderColor: appPalette.primary,
            backgroundColor: appPalette.softHover,
          },
          '& .MuiButton-endIcon': {
            color: appPalette.primary,
            transform: active ? 'rotate(180deg)' : 'rotate(0deg)',
            transition: 'transform 160ms ease',
          },
        }}
      >
        <Typography
          component="span"
          sx={{
            fontSize,
            fontWeight: 700,
            lineHeight: 1.2,
            maxWidth: '100%',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
          }}
        >
          {resolvedValue}
        </Typography>
      </Button>
    );
  }
);
