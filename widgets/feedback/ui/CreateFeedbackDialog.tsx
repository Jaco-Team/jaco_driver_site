import React from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Box,
  Typography,
  Chip,
  FormControlLabel,
  Checkbox,
  Button,
} from '@mui/material';
import { DropzoneArea } from 'mui-file-dropzone';
import MyTextInput from '@/shared/ui/MyTextInput';
import { useFeedbackStore } from '@/widgets/feedback/model/feedback.store';
import { feedbackTypes } from '@/entities/feedback/model/types';

interface CreateFeedbackDialogProps {
  open: boolean;
  onClose: () => void;
}

export const CreateFeedbackDialog: React.FC<CreateFeedbackDialogProps> = ({ open, onClose }) => {
  const { type, title, description, img, is_need_notification, setForm, saveFeedbacks, isLoad } =
    useFeedbackStore();

  const handleSave = async () => {
    await saveFeedbacks();
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="md"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: 3,
          padding: 1,
        },
      }}
    >
      <DialogTitle sx={{ textAlign: 'center', pb: 1 }}>
        <Box display="flex" flexDirection="column" alignItems="center" gap={1}>
          <Typography variant="h6" component="span">
            Создание нового предложения
          </Typography>
        </Box>
      </DialogTitle>
      <DialogContent>
        <Typography typography="h8">Тип</Typography>
        {feedbackTypes.map((u) => (
          <Chip
            key={u}
            label={u}
            style={{
              marginRight: '10px',
              backgroundColor: u === type ? '#cc0033' : '#f5f5f5',
              color: u === type ? 'white' : 'black',
            }}
            onClick={() => setForm('type', u)}
          />
        ))}

        <Typography typography="h8" sx={{ mt: 2 }}>
          Заголовок
        </Typography>
        <MyTextInput
          label="Введите заголовок"
          value={title}
          type={'text'}
          onChange={(e) => setForm('title', e.target.value)}
        />

        <Typography typography="h8" sx={{ mt: 2 }}>
          Описание
        </Typography>
        <MyTextInput
          rows={5}
          multiline
          label="Расскажите о проблемах в работе приложения, предложите, как можно улучшить систему"
          value={description}
          type={'text'}
          onChange={(e) => setForm('description', e.target.value)}
        />

        <Typography typography="h8" sx={{ mt: 2, mb: 2 }}>
          Изображение (опционально)
        </Typography>
        <DropzoneArea
          onChange={(files) => setForm('img', files)}
          acceptedFiles={['image/jpeg', 'image/png', 'application/pdf']}
          fileObjects={img || []}
          maxFileSize={5000000}
          dropzoneText={'Перетащите файл сюда или нажмите для выбора'}
          showPreviews={true}
          showPreviewsInDropzone={false}
          showFileNamesInPreview={true}
          useChipsForPreview={false}
          style={{ minHeight: '120px', maxHeight: '160px' }}
        />

        <FormControlLabel
          control={
            <Checkbox
              checked={is_need_notification}
              onChange={(e) => setForm('is_need_notification', e.target.checked)}
            />
          }
          label="Уведомить о решении"
        />
      </DialogContent>
      <DialogActions sx={{ gap: 2, pb: 3 }}>
        <Button onClick={onClose} variant="outlined" color="inherit" size="large" disabled={isLoad}>
          Нет
        </Button>
        <Button onClick={handleSave} variant="contained" size="large" autoFocus disabled={isLoad}>
          {isLoad ? 'Сохранение...' : 'Создать'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};
