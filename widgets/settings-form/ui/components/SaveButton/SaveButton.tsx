import React from 'react';
import Button from '@mui/material/Button';
import Paper from '@mui/material/Paper';
import Grid from '@mui/material/Grid';

interface SaveButtonProps {
  onClick: () => void;
  isSaving: boolean;
  fontSize?: number;
  buttonText?: string;
  savingText?: string;
}

export const SaveButton: React.FC<SaveButtonProps> = ({
  onClick,
  isSaving,
  fontSize = 14,
  buttonText = 'Сохранить',
  savingText = 'Сохраняем...',
}) => {
  return (
    <Grid size={12} style={{ marginTop: 10, marginBottom: 50 }}>
      <Paper style={{ padding: 20 }} elevation={5}>
        <Button
          disabled={isSaving}
          onClick={onClick}
          color="primary"
          variant="contained"
          style={{ width: '100%', fontSize }}
        >
          {isSaving ? savingText : buttonText}
        </Button>
      </Paper>
    </Grid>
  );
};
