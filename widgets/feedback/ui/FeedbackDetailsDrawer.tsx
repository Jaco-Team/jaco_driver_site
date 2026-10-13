import React from 'react';
import {
  SwipeableDrawer,
  Box,
  IconButton,
  Typography,
  Divider,
  Chip,
  Dialog,
  CircularProgress,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import { Feedback, statusArr } from '@/entities/feedback/model/types';
import { clampFeedbackFontSize } from '@/widgets/feedback/model/feedbackTypography';

interface FeedbackDetailsDrawerProps {
  open: boolean;
  feedback: Feedback | null;
  onClose: () => void;
  globalFontSize: number;
}

interface FeedbackImageCardProps {
  image: string;
  index: number;
  onOpen: () => void;
}

const FeedbackImageCard: React.FC<FeedbackImageCardProps> = ({ image, index, onOpen }) => {
  const [loadState, setLoadState] = React.useState<'loading' | 'loaded' | 'error'>('loading');
  const [retryAttempt, setRetryAttempt] = React.useState(0);
  const imageNumber = index + 1;
  const retrySeparator = image.includes('?') ? '&' : '?';
  const imageSource =
    retryAttempt === 0 ? image : `${image}${retrySeparator}feedback_retry=${retryAttempt}`;

  const handleClick = () => {
    if (loadState === 'loaded') {
      onOpen();
      return;
    }

    if (loadState === 'error') {
      setLoadState('loading');
      setRetryAttempt((attempt) => attempt + 1);
    }
  };

  const ariaLabel =
    loadState === 'loaded'
      ? `Открыть изображение ${imageNumber}`
      : loadState === 'error'
        ? `Повторить загрузку изображения ${imageNumber}`
        : `Загружается изображение ${imageNumber}`;

  return (
    <Box
      component="button"
      type="button"
      aria-label={ariaLabel}
      onClick={handleClick}
      sx={{
        position: 'relative',
        width: '100%',
        minHeight: 220,
        height: 320,
        p: 0,
        overflow: 'hidden',
        borderRadius: '16px',
        border: '1px solid',
        borderColor: 'divider',
        backgroundColor: 'action.hover',
        cursor: loadState === 'loaded' ? 'zoom-in' : loadState === 'error' ? 'pointer' : 'default',
        outline: 'none',
        '&:focus-visible': {
          outline: '2px solid',
          outlineColor: 'primary.main',
          outlineOffset: 2,
        },
      }}
    >
      <Box
        component="img"
        key={imageSource}
        src={imageSource}
        alt={`Изображение предложения ${imageNumber}`}
        loading="lazy"
        decoding="async"
        onLoad={() => setLoadState('loaded')}
        onError={() => setLoadState('error')}
        sx={{
          display: 'block',
          width: '100%',
          height: '100%',
          objectFit: 'contain',
          opacity: loadState === 'loaded' ? 1 : 0,
          transition: 'opacity 160ms ease-out',
          userSelect: 'none',
          WebkitUserDrag: 'none',
        }}
      />

      {loadState === 'loading' ? (
        <Box
          role="status"
          sx={{
            position: 'absolute',
            inset: 0,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 1.2,
            color: 'text.secondary',
          }}
        >
          <CircularProgress size={32} />
          <Typography component="span" sx={{ fontSize: 14, fontWeight: 600 }}>
            Загрузка изображения…
          </Typography>
        </Box>
      ) : null}

      {loadState === 'error' ? (
        <Box
          sx={{
            position: 'absolute',
            inset: 0,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 0.6,
            px: 2,
            color: 'text.secondary',
          }}
        >
          <Typography component="span" sx={{ fontSize: 15, fontWeight: 700 }}>
            Не удалось загрузить изображение
          </Typography>
          <Typography component="span" sx={{ fontSize: 13 }}>
            Нажмите, чтобы повторить
          </Typography>
        </Box>
      ) : null}
    </Box>
  );
};

export const FeedbackDetailsDrawer: React.FC<FeedbackDetailsDrawerProps> = ({
  open,
  feedback,
  onClose,
  globalFontSize,
}) => {
  const [isImageViewerOpen, setImageViewerOpen] = React.useState(false);
  const [selectedImageIndex, setSelectedImageIndex] = React.useState(0);
  const modalBaseFontSize = clampFeedbackFontSize(globalFontSize, 14, 20);
  const modalTitleFontSize = clampFeedbackFontSize(modalBaseFontSize + 6, 20, 30);
  const sectionTitleFontSize = clampFeedbackFontSize(modalBaseFontSize + 1, 15, 24);
  const bodyFontSize = modalBaseFontSize;
  const metaFontSize = clampFeedbackFontSize(modalBaseFontSize - 1, 13, 18);
  const chipFontSize = clampFeedbackFontSize(modalBaseFontSize - 1, 13, 19);
  const images = React.useMemo(() => {
    const imageUrls = [...(Array.isArray(feedback?.images) ? feedback.images : []), feedback?.link]
      .map((image) => String(image ?? '').trim())
      .filter(Boolean);

    return imageUrls.filter((image, index) => imageUrls.indexOf(image) === index);
  }, [feedback]);

  React.useEffect(() => {
    if (open) {
      return undefined;
    }

    let cancelled = false;
    queueMicrotask(() => {
      if (!cancelled) {
        setImageViewerOpen(false);
        setSelectedImageIndex(0);
      }
    });

    return () => {
      cancelled = true;
    };
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
      slotProps={{
        root: {
          keepMounted: true,
        },
        paper: {
          sx: {
            borderTopLeftRadius: 28,
            borderTopRightRadius: 28,
            maxHeight: '86vh',
            backgroundColor: 'var(--app-surface)',
            backgroundImage: 'none',
            border: '1px solid',
            borderColor: 'divider',
            boxShadow: '0 24px 44px var(--app-shadow)',
            overflow: 'hidden',
          },
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
            backgroundColor: 'divider',
          }}
        />
      </Box>

      <Box sx={{ p: 2.5, pt: 0.4, overflowY: 'auto', maxHeight: 'calc(86vh - 54px)' }}>
        <Typography
          sx={{
            fontWeight: 800,
            fontSize: modalTitleFontSize,
            color: 'text.primary',
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
            <AccessTimeIcon sx={{ fontSize: metaFontSize, color: 'text.secondary' }} />
            <Typography sx={{ fontSize: metaFontSize, color: 'text.secondary', lineHeight: 1 }}>
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
              backgroundColor: 'action.selected',
              color: 'text.primary',
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
            color: 'text.primary',
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
            color: 'text.secondary',
            whiteSpace: 'pre-wrap',
            wordBreak: 'break-word',
          }}
        >
          {feedback.description || 'Нет описания'}
        </Typography>
        {images.length > 0 ? (
          <>
            <Typography
              sx={{
                mb: 0.65,
                fontWeight: 700,
                fontSize: sectionTitleFontSize,
                lineHeight: 1.3,
                color: 'text.primary',
                whiteSpace: 'pre-wrap',
                wordBreak: 'break-word',
              }}
            >
              Изображение
            </Typography>
            <Box
              sx={{
                display: 'grid',
                gridTemplateColumns: '1fr',
                gap: 1.25,
                maxWidth: 500,
              }}
            >
              {images.map((image, index) => (
                <FeedbackImageCard
                  key={`${image}-${index}`}
                  image={image}
                  index={index}
                  onOpen={() => {
                    setSelectedImageIndex(index);
                    setImageViewerOpen(true);
                  }}
                />
              ))}
            </Box>
          </>
        ) : null}

        <Typography
          sx={{
            mb: 0.65,
            fontWeight: 700,
            fontSize: sectionTitleFontSize,
            lineHeight: 1.3,
            color: 'text.primary',
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
            color: 'text.secondary',
            backgroundColor: 'action.hover',
            padding: '12px 14px',
            borderRadius: '16px',
            fontWeight: '500',
            border: '1px solid',
            borderColor: 'divider',
            whiteSpace: 'pre-wrap',
            wordBreak: 'break-word',
          }}
        >
          {feedback.answer || 'Нет ответа'}
        </Typography>
      </Box>

      <Dialog
        fullScreen
        open={isImageViewerOpen && images.length > 0}
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
            src={images[selectedImageIndex] ?? ''}
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
