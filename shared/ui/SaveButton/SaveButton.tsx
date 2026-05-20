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
  const baseFontSize = Number.isFinite(fontSize) && fontSize > 0 ? fontSize : 14;
  const actionFontSize = Math.min(Math.max(baseFontSize + 1, 15), 24);

  return (
    <Grid size={12} sx={{ mt: '10px', mb: 'calc(env(safe-area-inset-bottom, 0px) + 22px)' }}>
      <Paper
        className="settingsCard settingsCard--action"
        elevation={0}
        style={{ padding: 0, backgroundColor: 'transparent' }}
      >
        <Button
          disabled={isSaving}
          onClick={onClick}
          color="primary"
          variant="contained"
          sx={{
            width: '100%',
            minHeight: 54,
            borderRadius: '16px',
            textTransform: 'none',
            fontSize: actionFontSize,
            fontWeight: 700,
            boxShadow: '0 12px 24px rgba(146, 0, 36, 0.28)',
            '&:hover': {
              boxShadow: '0 14px 28px rgba(146, 0, 36, 0.34)',
            },
          }}
        >
          {isSaving ? savingText : buttonText}
        </Button>
      </Paper>
    </Grid>
  );
};
