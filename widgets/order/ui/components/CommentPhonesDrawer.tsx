import React from 'react';
import Badge from '@mui/material/Badge';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import IconButton from '@mui/material/IconButton';
import SwipeableDrawer from '@mui/material/SwipeableDrawer';
import Typography from '@mui/material/Typography';
import PhoneIcon from '@mui/icons-material/Phone';

import { log, logTel } from '@/components/analytics';
import type { ExtractedPhone } from '@/shared/lib/extractPhones';
import { appPalette } from '@/shared/styles/appPalette';

const CALL_BUTTON_HEIGHT = 44;

interface CommentPhonesControlProps {
  phones: ExtractedPhone[];
  onOpenMultiple: () => void;
}

interface CommentPhonesDrawerProps {
  open: boolean;
  phones: ExtractedPhone[];
  globalFontSize: number;
  onClose: () => void;
}

function clampFontSize(value: number, min: number, max: number) {
  return Math.min(Math.max(value, min), max);
}

function callCommentPhone(phone: ExtractedPhone, event?: React.MouseEvent) {
  logTel('call_order_comment', phone.tel, 'Звонок по номеру из комментария', event);
}

const callIconButtonSx = {
  width: CALL_BUTTON_HEIGHT,
  height: CALL_BUTTON_HEIGHT,
  flexShrink: 0,
  alignSelf: 'center',
  backgroundColor: appPalette.soft,
  color: appPalette.primary,
  '&:hover': {
    backgroundColor: appPalette.softStrong,
  },
} as const;

export function CommentPhonesControl({ phones, onOpenMultiple }: CommentPhonesControlProps) {
  if (phones.length === 0) {
    return null;
  }

  if (phones.length === 1) {
    const phone = phones[0];

    return (
      <IconButton
        component="a"
        href={`tel:${phone.tel}`}
        aria-label={`Позвонить ${phone.display}`}
        data-testid="order-card-comment-call"
        onClick={(event) => {
          event.stopPropagation();
          callCommentPhone(phone, event);
        }}
        sx={callIconButtonSx}
      >
        <PhoneIcon />
      </IconButton>
    );
  }

  return (
    <IconButton
      type="button"
      aria-label="Выбрать номер из комментария"
      data-testid="order-card-comment-call"
      onClick={(event) => {
        event.stopPropagation();
        log('order_comment_phones_open', 'Открытие номеров из комментария');
        onOpenMultiple();
      }}
      sx={callIconButtonSx}
    >
      <Badge
        badgeContent={phones.length}
        overlap="circular"
        sx={{
          '& .MuiBadge-badge': {
            backgroundColor: appPalette.brand,
            color: '#fff',
            fontWeight: 700,
          },
        }}
      >
        <PhoneIcon />
      </Badge>
    </IconButton>
  );
}

export function CommentPhonesDrawer({
  open,
  phones,
  globalFontSize,
  onClose,
}: CommentPhonesDrawerProps) {
  const titleFontSize = clampFontSize(globalFontSize + 4, 18, 24);
  const actionFontSize = clampFontSize(globalFontSize + 1, 14, 18);

  return (
    <SwipeableDrawer
      anchor="bottom"
      open={open}
      onClose={onClose}
      onOpen={() => {}}
      disableSwipeToOpen
      data-testid="order-card-comment-phones-drawer"
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
            zIndex: (theme) => theme.zIndex.modal + 2,
          },
        },
      }}
      sx={{
        zIndex: (theme) => theme.zIndex.modal + 2,
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
          onClick={onClose}
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

        <Typography
          component="h2"
          sx={{
            fontSize: titleFontSize,
            fontWeight: 700,
            lineHeight: 1.2,
            color: appPalette.text,
            mb: 2,
          }}
        >
          Позвонить
        </Typography>

        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
          {phones.map((phone) => (
            <Button
              key={phone.digits}
              fullWidth
              variant="contained"
              disableElevation
              href={`tel:${phone.tel}`}
              data-testid={`order-card-comment-phone-${phone.digits}`}
              onClick={(event) => {
                callCommentPhone(phone, event);
                onClose();
              }}
              sx={{
                height: CALL_BUTTON_HEIGHT,
                minHeight: CALL_BUTTON_HEIGHT,
                borderRadius: '12px',
                textTransform: 'none',
                fontWeight: 600,
                fontSize: actionFontSize,
                backgroundColor: '#E0E0E0',
                color: appPalette.text,
                boxShadow: 'none',
                '&:hover': {
                  backgroundColor: '#d5d5d5',
                  boxShadow: 'none',
                },
              }}
            >
              {phone.display}
            </Button>
          ))}
        </Box>
      </Box>
    </SwipeableDrawer>
  );
}
