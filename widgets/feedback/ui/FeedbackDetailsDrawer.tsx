import React from 'react';
import { SwipeableDrawer, Box, IconButton, Typography, Divider, Chip, Dialog } from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import { Feedback, statusArr } from '@/entities/feedback/model/types';
import { useHeaderStore } from '@/features/header/model/header.store';

interface FeedbackDetailsDrawerProps {
  open: boolean;
  feedback: Feedback | null;
  onClose: () => void;
}

const DEFAULT_GLOBAL_FONT_SIZE = 16;

export const FeedbackDetailsDrawer: React.FC<FeedbackDetailsDrawerProps> = ({
  open,
  feedback,
  onClose,
}) => {
  const [isImageViewerOpen, setImageViewerOpen] = React.useState(false);
  const globalFontSize = useHeaderStore((state) => state.globalFontSize);
  const normalizedGlobalFontSize =
    Number.isFinite(globalFontSize) && globalFontSize > 0
      ? globalFontSize
      : DEFAULT_GLOBAL_FONT_SIZE;
  const modalBaseFontSize = Math.min(Math.max(normalizedGlobalFontSize, 14), 20);
  const modalTitleFontSize = modalBaseFontSize * 1.42;
  const sectionTitleFontSize = modalBaseFontSize * 1.08;
  const bodyFontSize = modalBaseFontSize;
  const metaFontSize = Math.max(modalBaseFontSize * 0.94, 14);
  const chipFontSize = Math.max(modalBaseFontSize * 0.98, 14);

  React.useEffect(() => {
    if (!open) {
      setImageViewerOpen(false);
    }
  }, [open]);

  const getStatusColor = (status: number) => {
    switch (status) {
      case 1:
        return '#42AAFF';
      case 2:
        return '#ffeccf';
      case 3:
        return '#eceff3';
      case 4:
        return '#dff6df';
      default:
        return '#eceff3';
    }
  };

  const getStatusTextColor = (status: number) => {
    if (status === 1) {
      return '#ffffff';
    }

    if (status === 4) {
      return '#1f6b2a';
    }

    return '#253343';
  };

  if (!feedback) return null;

  return (
    <SwipeableDrawer
      anchor="bottom"
      open={open}
      onClose={onClose}
      onOpen={() => {}}
      disableSwipeToOpen={false}
      swipeAreaWidth={40}
      ModalProps={{
        keepMounted: true,
      }}
      PaperProps={{
        sx: {
          borderTopLeftRadius: 28,
          borderTopRightRadius: 28,
          maxHeight: '86vh',
          border: '1px solid rgba(66, 98, 125, 0.14)',
          boxShadow: '0 24px 44px rgba(31, 43, 54, 0.2)',
          overflow: 'hidden',
        },
      }}
    >
      <Box
        sx={{
          width: '100%',
          display: 'flex',
          justifyContent: 'center',
          pt: 1.15,
          pb: 1,
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

      <Box sx={{ p: 2.5, pt: 0.4, overflowY: 'auto', maxHeight: 'calc(86vh - 54px)' }}>
        <Typography
          sx={{
            fontWeight: 800,
            fontSize: modalTitleFontSize,
            color: '#1f2b36',
            mb: 2,
            pr: 4,
            wordBreak: 'break-word',
          }}
        >
          {feedback.title}
        </Typography>

        <Divider sx={{ mb: 1.8 }} />

        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1.8, flexWrap: 'wrap' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
            <AccessTimeIcon sx={{ fontSize: metaFontSize, color: '#6e7884' }} />
            <Typography sx={{ fontSize: metaFontSize, color: '#66707b', lineHeight: 1 }}>
              {feedback.date_time_create?.replace(/^(\d{4})-(\d{2})-(\d{2}).*$/, '$3.$2.$1') || '—'}
            </Typography>
          </Box>
          <Chip
            label={statusArr.find((u) => u.id === feedback.status)?.name}
            size="small"
            sx={{
              backgroundColor: getStatusColor(feedback.status),
              color: getStatusTextColor(feedback.status),
              borderRadius: '999px',
              fontWeight: 700,
              height: 32,
              px: 0.35,
              fontSize: chipFontSize,
            }}
          />
          <Chip
            label={feedback.type}
            size="small"
            sx={{
              backgroundColor: '#f0f2f5',
              color: '#253343',
              borderRadius: '999px',
              fontWeight: 600,
              height: 32,
              px: 0.35,
              fontSize: chipFontSize,
            }}
          />
        </Box>

        <Typography
          sx={{
            mb: 0.65,
            fontWeight: 700,
            fontSize: sectionTitleFontSize,
            lineHeight: 1.3,
            color: '#253343',
            whiteSpace: 'pre-wrap',
            wordBreak: 'break-word',
          }}
        >
          Описание
        </Typography>
        <Typography
          sx={{
            mb: 1.4,
            fontSize: bodyFontSize,
            lineHeight: 1.45,
            color: '#5a6470',
            whiteSpace: 'pre-wrap',
            wordBreak: 'break-word',
          }}
        >
          {feedback.description || 'Нет описания'}
        </Typography>
        {feedback.link ? (
          <>
            <Typography
              sx={{
                mb: 0.65,
                fontWeight: 700,
                fontSize: sectionTitleFontSize,
                lineHeight: 1.3,
                color: '#253343',
                whiteSpace: 'pre-wrap',
                wordBreak: 'break-word',
              }}
            >
              Изображение
            </Typography>
            <Box
              role="button"
              tabIndex={0}
              onClick={() => setImageViewerOpen(true)}
              onKeyDown={(event) => {
                if (event.key === 'Enter' || event.key === ' ') {
                  event.preventDefault();
                  setImageViewerOpen(true);
                }
              }}
              sx={{
                width: '100%',
                maxWidth: 500,
                minHeight: 220,
                height: 320,
                borderRadius: '16px',
                border: '1px solid rgba(66, 98, 125, 0.2)',
                backgroundImage: `url(${feedback.link})`,
                backgroundSize: 'contain',
                backgroundRepeat: 'no-repeat',
                backgroundPosition: 'center',
                cursor: 'zoom-in',
                outline: 'none',
              }}
            />
          </>
        ) : null}

        <Typography
          sx={{
            mb: 0.65,
            fontWeight: 700,
            fontSize: sectionTitleFontSize,
            lineHeight: 1.3,
            color: '#253343',
            whiteSpace: 'pre-wrap',
            wordBreak: 'break-word',
          }}
        >
          Ответ
        </Typography>
        <Typography
          sx={{
            mb: 1.2,
            fontSize: bodyFontSize,
            lineHeight: 1.45,
            color: '#5a6470',
            backgroundColor: '#f5f5f5',
            padding: '12px 14px',
            borderRadius: '16px',
            fontWeight: '500',
            border: '1px solid rgba(66, 98, 125, 0.1)',
            whiteSpace: 'pre-wrap',
            wordBreak: 'break-word',
          }}
        >
          {feedback.answer || 'Нет ответа'}
        </Typography>
      </Box>

      <Dialog
        fullScreen
        open={isImageViewerOpen}
        onClose={() => setImageViewerOpen(false)}
        sx={{
          '& .MuiDialog-paper': {
            backgroundColor: 'rgba(8, 10, 16, 0.96)',
          },
        }}
      >
        <IconButton
          aria-label="Закрыть изображение"
          onClick={() => setImageViewerOpen(false)}
          sx={{
            position: 'absolute',
            top: 12,
            right: 12,
            color: '#fff',
            zIndex: 2,
            bgcolor: 'rgba(255, 255, 255, 0.14)',
            '&:hover': {
              bgcolor: 'rgba(255, 255, 255, 0.24)',
            },
          }}
        >
          <CloseIcon />
        </IconButton>

        <Box
          onClick={() => setImageViewerOpen(false)}
          sx={{
            width: '100%',
            height: '100%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            p: 2,
            boxSizing: 'border-box',
            cursor: 'zoom-out',
          }}
        >
          <Box
            component="img"
            src={feedback.link ?? ''}
            alt="Изображение предложения"
            onClick={(event) => event.stopPropagation()}
            sx={{
              width: '100%',
              height: '100%',
              objectFit: 'contain',
              userSelect: 'none',
              WebkitUserDrag: 'none',
            }}
          />
        </Box>
      </Dialog>
    </SwipeableDrawer>
  );
};
