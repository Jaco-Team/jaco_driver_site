import React from 'react';
import {
  SwipeableDrawer,
  Box,
  Typography,
  Chip,
  FormControlLabel,
  Checkbox,
  Button,
  Divider,
  TextField,
} from '@mui/material';

import { useFeedbackStore } from '@/widgets/feedback/model/feedback.store';
import { feedbackTypes } from '@/entities/feedback/model/types';

interface CreateFeedbackDialogProps {
  open: boolean;
  onClose: () => void;
}

export const CreateFeedbackDialog: React.FC<CreateFeedbackDialogProps> = ({ open, onClose }) => {
  const { type, title, description, img, is_need_notification, setForm, saveFeedbacks, isLoad } =
    useFeedbackStore();
  const fileInputRef = React.useRef<HTMLInputElement | null>(null);

  const handleSave = async () => {
    await saveFeedbacks();
  };

  const handleFileInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files ?? []).filter((file) =>
      file.type.toLowerCase().startsWith('image/')
    );
    setForm('img', files);
  };

  const handleDropFiles = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    const files = Array.from(event.dataTransfer.files ?? []).filter((file) =>
      file.type.toLowerCase().startsWith('image/')
    );
    if (files.length > 0) {
      setForm('img', files);
    }
  };

  const fileHintText =
    img && img.length > 0 ? `Выбрано файлов: ${img.length}` : 'Нажмите, чтобы добавить изображения';

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
          borderTopLeftRadius: 30,
          borderTopRightRadius: 30,
          maxHeight: '88vh',
          background: '#ffffff',
          overflow: 'hidden',
        },
      }}
    >
      <Box
        sx={{
          px: 2.5,
          pt: 1.25,
          pb: 'calc(env(safe-area-inset-bottom, 0px) + 16px)',
          maxHeight: '88vh',
          overflowY: 'auto',
        }}
      >
        <Box
          sx={{
            width: '100%',
            display: 'flex',
            justifyContent: 'center',
            pb: 1.25,
            cursor: 'pointer',
          }}
          onClick={onClose}
        >
          <Box
            sx={{
              width: 44,
              height: 5,
              borderRadius: 999,
              backgroundColor: 'rgba(31, 43, 54, 0.4)',
            }}
          />
        </Box>

        <Typography
          sx={{
            fontSize: '1.7rem',
            fontWeight: 800,
            color: '#1e1216',
            lineHeight: 1.2,
            mb: 2.25,
          }}
        >
          Новое предложение
        </Typography>

        <Divider sx={{ mx: -2.5, mb: 2.25 }} />

        <Typography sx={{ fontSize: '1.4rem', fontWeight: 700, color: '#312126', mb: 1 }}>
          Тип
        </Typography>

        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1.25, mb: 2.5 }}>
          {feedbackTypes.map((feedbackType) => (
            <Chip
              key={feedbackType}
              label={feedbackType}
              onClick={() => setForm('type', feedbackType)}
              sx={{
                height: 46,
                borderRadius: 999,
                px: 1,
                backgroundColor: feedbackType === type ? '#cc0033' : '#f0f2f5',
                color: feedbackType === type ? '#ffffff' : '#222',
                fontSize: '1.2rem',
                fontWeight: 500,
              }}
            />
          ))}
        </Box>

        <Typography sx={{ fontSize: '1.4rem', fontWeight: 700, color: '#312126', mb: 1 }}>
          Заголовок
        </Typography>
        <TextField
          fullWidth
          size="small"
          placeholder="Введите заголовок"
          value={title}
          onChange={(event) => setForm('title', event.target.value)}
          sx={{
            mb: 2.5,
            '& .MuiOutlinedInput-root': {
              borderRadius: '12px',
              minHeight: 58,
            },
            '& .MuiOutlinedInput-input': {
              fontSize: '1.1rem',
              py: 1.35,
            },
          }}
        />

        <Typography sx={{ fontSize: '1.4rem', fontWeight: 700, color: '#312126', mb: 1 }}>
          Описание
        </Typography>
        <TextField
          fullWidth
          multiline
          minRows={4}
          placeholder="Расскажите о проблемах в работе приложения, предложите, как можно улучшить систему"
          value={description}
          onChange={(event) => setForm('description', event.target.value)}
          sx={{
            mb: 2.5,
            '& .MuiOutlinedInput-root': {
              borderRadius: '12px',
            },
            '& .MuiOutlinedInput-input': {
              fontSize: '1.1rem',
              lineHeight: 1.4,
            },
          }}
        />

        <Typography sx={{ fontSize: '1.4rem', fontWeight: 700, color: '#312126', mb: 1 }}>
          Изображение (опционально)
        </Typography>
        <Box
          role="button"
          tabIndex={0}
          onClick={() => fileInputRef.current?.click()}
          onKeyDown={(event) => {
            if (event.key === 'Enter' || event.key === ' ') {
              event.preventDefault();
              fileInputRef.current?.click();
            }
          }}
          onDragOver={(event) => event.preventDefault()}
          onDrop={handleDropFiles}
          sx={{
            borderRadius: '12px',
            border: '1px dashed rgba(66, 98, 125, 0.35)',
            backgroundColor: '#ffffff',
            minHeight: 90,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            px: 2,
            mb: 1.5,
            cursor: 'pointer',
            outline: 'none',
          }}
        >
          <Typography
            sx={{
              color: img && img.length > 0 ? '#1f2b36' : '#7f8790',
              fontSize: '1.1rem',
              textAlign: 'center',
            }}
          >
            {fileHintText}
          </Typography>
        </Box>

        <input
          ref={fileInputRef}
          type="file"
          hidden
          multiple
          accept="image/*"
          onChange={handleFileInputChange}
        />

        <FormControlLabel
          control={
            <Checkbox
              checked={is_need_notification}
              onChange={(event) => setForm('is_need_notification', event.target.checked)}
              sx={{
                '& .MuiSvgIcon-root': {
                  fontSize: 26,
                },
              }}
            />
          }
          label="Уведомить о решении"
          sx={{
            mb: 2.5,
            '& .MuiFormControlLabel-label': {
              fontSize: '1.2rem',
              color: '#404040',
            },
          }}
        />

        <Button
          fullWidth
          onClick={handleSave}
          variant="contained"
          disabled={isLoad}
          sx={{
            minHeight: 58,
            borderRadius: 3,
            textTransform: 'none',
            fontSize: '1.35rem',
            fontWeight: 700,
          }}
        >
          {isLoad ? 'Отправка...' : 'Отправить'}
        </Button>
      </Box>
    </SwipeableDrawer>
  );
};
