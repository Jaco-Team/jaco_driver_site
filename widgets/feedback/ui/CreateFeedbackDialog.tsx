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
import { clampFeedbackFontSize } from '@/widgets/feedback/model/feedbackTypography';

interface CreateFeedbackDialogProps {
  open: boolean;
  onClose: () => void;
  globalFontSize: number;
}

export const CreateFeedbackDialog: React.FC<CreateFeedbackDialogProps> = ({
  open,
  onClose,
  globalFontSize,
}) => {
  const { type, title, description, img, is_need_notification, setForm, saveFeedbacks, isSaving } =
    useFeedbackStore();
  const fileInputRef = React.useRef<HTMLInputElement | null>(null);
  const modalBaseFontSize = clampFeedbackFontSize(globalFontSize, 14, 20);
  const modalTitleFontSize = clampFeedbackFontSize(modalBaseFontSize + 6, 20, 30);
  const sectionTitleFontSize = clampFeedbackFontSize(modalBaseFontSize + 1, 15, 24);
  const bodyFontSize = modalBaseFontSize;
  const helperFontSize = clampFeedbackFontSize(modalBaseFontSize - 1, 13, 18);
  const chipFontSize = clampFeedbackFontSize(modalBaseFontSize - 1, 13, 19);
  const checkboxIconFontSize = clampFeedbackFontSize(modalBaseFontSize + 7, 20, 30);
  const actionFontSize = clampFeedbackFontSize(modalBaseFontSize + 2, 15, 24);

  const handleSave = async () => {
    if (isSaving) {
      return;
    }

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
      slotProps={{
        root: {
          keepMounted: true,
        },
        paper: {
          sx: {
            borderTopLeftRadius: 28,
            borderTopRightRadius: 28,
            maxHeight: '86vh',
            background: '#ffffff',
            overflow: 'hidden',
            border: '1px solid rgba(66, 98, 125, 0.14)',
            boxShadow: '0 24px 44px rgba(31, 43, 54, 0.2)',
          },
        },
      }}
    >
      <Box
        sx={{
          px: 2.5,
          pt: 1.15,
          pb: 'calc(env(safe-area-inset-bottom, 0px) + 14px)',
          maxHeight: '86vh',
          overflowY: 'auto',
          position: 'relative',
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
              width: 62,
              height: 6,
              borderRadius: 999,
              backgroundColor: 'rgba(31, 43, 54, 0.2)',
            }}
          />
        </Box>

        <Typography
          sx={{
            fontSize: modalTitleFontSize,
            fontWeight: 800,
            color: '#1f2b36',
            lineHeight: 1.2,
            mb: 2,
          }}
        >
          Новое предложение
        </Typography>

        <Divider sx={{ mx: -2.5, mb: 2 }} />

        <Typography
          sx={{ fontSize: sectionTitleFontSize, fontWeight: 700, color: '#253343', mb: 1 }}
        >
          Тип
        </Typography>

        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 2.15 }}>
          {feedbackTypes.map((feedbackType) => (
            <Chip
              key={feedbackType}
              label={feedbackType}
              onClick={() => {
                if (!isSaving) {
                  setForm('type', feedbackType);
                }
              }}
              disabled={isSaving}
              sx={{
                height: 40,
                borderRadius: 999,
                px: 0.65,
                border: feedbackType === type ? '1px solid #cc0033' : '1px solid #e0e4e9',
                backgroundColor: feedbackType === type ? '#cc0033' : '#f0f2f5',
                color: feedbackType === type ? '#ffffff' : '#253343',
                fontSize: chipFontSize,
                fontWeight: 600,
                '&.MuiChip-clickable:hover': {
                  backgroundColor: feedbackType === type ? '#b4002d' : '#e8edf2',
                },
              }}
            />
          ))}
        </Box>

        <Typography
          sx={{ fontSize: sectionTitleFontSize, fontWeight: 700, color: '#253343', mb: 1 }}
        >
          Заголовок
        </Typography>
        <TextField
          fullWidth
          size="small"
          placeholder="Введите заголовок"
          value={title}
          onChange={(event) => setForm('title', event.target.value)}
          disabled={isSaving}
          inputProps={{ maxLength: 255 }}
          sx={{
            mb: 2,
            '& .MuiOutlinedInput-root': {
              borderRadius: '16px',
              minHeight: 54,
            },
            '& .MuiOutlinedInput-input': {
              fontSize: bodyFontSize,
              py: 1.15,
            },
            '& .MuiInputBase-input::placeholder': {
              color: '#8a94a0',
              opacity: 1,
            },
          }}
        />

        <Typography
          sx={{ fontSize: sectionTitleFontSize, fontWeight: 700, color: '#253343', mb: 1 }}
        >
          Описание
        </Typography>
        <TextField
          fullWidth
          multiline
          minRows={4}
          placeholder="Расскажите о проблемах в работе приложения, предложите, как можно улучшить систему"
          value={description}
          onChange={(event) => setForm('description', event.target.value)}
          disabled={isSaving}
          inputProps={{ maxLength: 5000 }}
          sx={{
            mb: 2,
            '& .MuiOutlinedInput-root': {
              borderRadius: '16px',
            },
            '& .MuiOutlinedInput-input': {
              fontSize: bodyFontSize,
              lineHeight: 1.4,
            },
            '& .MuiInputBase-input::placeholder': {
              color: '#8a94a0',
              opacity: 1,
            },
          }}
        />

        <Typography
          sx={{ fontSize: sectionTitleFontSize, fontWeight: 700, color: '#253343', mb: 1 }}
        >
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
            borderRadius: '16px',
            border: '1px dashed rgba(66, 98, 125, 0.35)',
            backgroundColor: '#ffffff',
            minHeight: 86,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            px: 2,
            mb: 1.25,
            cursor: 'pointer',
            outline: 'none',
          }}
        >
          <Typography
            sx={{
              color: img && img.length > 0 ? '#1f2b36' : '#7f8790',
              fontSize: helperFontSize,
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
              disabled={isSaving}
              sx={{
                '& .MuiSvgIcon-root': {
                  fontSize: checkboxIconFontSize,
                },
              }}
            />
          }
          label="Уведомить о решении"
          sx={{
            mb: 1.6,
            '& .MuiFormControlLabel-label': {
              fontSize: bodyFontSize,
              color: '#404850',
            },
          }}
        />

        <Button
          fullWidth
          onClick={handleSave}
          variant="contained"
          disabled={isSaving}
          aria-busy={isSaving}
          sx={{
            minHeight: 54,
            borderRadius: '16px',
            textTransform: 'none',
            fontSize: actionFontSize,
            fontWeight: 700,
            pointerEvents: isSaving ? 'none' : 'auto',
            boxShadow: '0 12px 24px rgba(146, 0, 36, 0.28)',
            '&:hover': {
              boxShadow: '0 14px 28px rgba(146, 0, 36, 0.33)',
            },
          }}
        >
          {isSaving ? 'Отправка...' : 'Отправить'}
        </Button>
      </Box>
    </SwipeableDrawer>
  );
};
