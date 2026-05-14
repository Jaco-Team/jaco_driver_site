import React from 'react';
import { SwipeableDrawer, Box, IconButton, Typography, Divider, Chip, Dialog } from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import { Feedback, statusArr } from '@/entities/feedback/model/types';

interface FeedbackDetailsDrawerProps {
  open: boolean;
  feedback: Feedback | null;
  onClose: () => void;
}

export const FeedbackDetailsDrawer: React.FC<FeedbackDetailsDrawerProps> = ({
  open,
  feedback,
  onClose,
}) => {
  const [isImageViewerOpen, setImageViewerOpen] = React.useState(false);

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
        return '#F2F2F2';
      case 3:
        return '#f5f5f5';
      case 4:
        return 'green';
      default:
        return '#f5f5f5';
    }
  };

  const getStatusTextColor = (status: number) => {
    return status === 3 || status === 2 ? 'black' : 'white';
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
      sx={{
        '& .MuiDrawer-paper': {
          borderTopLeftRadius: 20,
          borderTopRightRadius: 20,
          maxHeight: '85vh',
        },
      }}
    >
      <Box
        sx={{
          width: '100%',
          display: 'flex',
          justifyContent: 'center',
          pt: 1.5,
          pb: 1,
          cursor: 'pointer',
        }}
        onClick={onClose}
      >
        <Box
          sx={{
            width: 40,
            height: 4,
            bgcolor: '#ddd',
            borderRadius: 2,
          }}
        />
      </Box>

      <IconButton
        onClick={onClose}
        sx={{
          position: 'absolute',
          right: 8,
          top: 8,
          zIndex: 1,
        }}
      >
        <CloseIcon />
      </IconButton>

      <Box sx={{ p: 3, pt: 0, overflowY: 'auto', maxHeight: 'calc(85vh - 60px)' }}>
        <Typography
          variant="h6"
          sx={{
            fontWeight: 700,
            mb: 2,
            pr: 4,
            wordBreak: 'break-word',
          }}
        >
          {feedback.title}
        </Typography>

        <Divider sx={{ mb: 2 }} />

        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2, flexWrap: 'wrap' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
            <AccessTimeIcon sx={{ fontSize: '1rem', color: '#666' }} />
            <Typography variant="body2" color="text.secondary">
              {feedback.date_time_create?.replace(/^(\d{4})-(\d{2})-(\d{2}).*$/, '$3.$2.$1') || '—'}
            </Typography>
          </Box>
          <Chip
            label={statusArr.find((u) => u.id === feedback.status)?.name}
            size="small"
            sx={{
              backgroundColor: getStatusColor(feedback.status),
              color: getStatusTextColor(feedback.status),
            }}
          />
          <Chip
            label={feedback.type}
            size="small"
            sx={{
              backgroundColor: '#f5f5f5',
              color: 'black',
            }}
          />
        </Box>

        <Typography
          sx={{
            mb: 1,
            lineHeight: 1.6,
            color: '#767070',
            whiteSpace: 'pre-wrap',
            wordBreak: 'break-word',
          }}
        >
          Описание
        </Typography>
        <Typography
          sx={{
            mb: 1,
            lineHeight: 1.6,
            color: '#333',
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
                mb: 1,
                lineHeight: 1.6,
                color: '#767070',
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
                height: 350,
                borderRadius: 2,
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
            mb: 1,
            lineHeight: 1.6,
            color: '#767070',
            whiteSpace: 'pre-wrap',
            wordBreak: 'break-word',
          }}
        >
          Ответ
        </Typography>
        <Typography
          sx={{
            mb: 5,
            lineHeight: 1.6,
            color: '#333',
            backgroundColor: '#f5f5f5',
            padding: '12px',
            borderRadius: 2,
            fontWeight: '500',
            fontSize: '1rem',
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
