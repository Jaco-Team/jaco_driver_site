import React from 'react';
import Snackbar from '@mui/material/Snackbar';
import MuiAlert, { AlertProps } from '@mui/material/Alert';

const Alert = React.forwardRef<HTMLDivElement, AlertProps>(function Alert(props, ref) {
  return <MuiAlert elevation={6} ref={ref} variant="filled" {...props} />;
});

export interface SnackbarState {
  open: boolean;
  vertical: 'top' | 'bottom';
  horizontal: 'left' | 'center' | 'right';
  severity: 'success' | 'error' | 'info' | 'warning';
  message: string;
}

interface SnackbarNotificationProps {
  state: SnackbarState;
  onClose: () => void;
  fontSize?: number;
  autoHideDuration?: number;
}

export const SnackbarNotification: React.FC<SnackbarNotificationProps> = ({
  state,
  onClose,
  fontSize = 14,
  autoHideDuration = 5000,
}) => {
  const { vertical, horizontal, open, severity, message } = state;

  return (
    <Snackbar
      anchorOrigin={{ vertical, horizontal }}
      open={open}
      onClose={onClose}
      autoHideDuration={autoHideDuration}
    >
      <Alert onClose={onClose} severity={severity} sx={{ width: '100%', fontSize }}>
        {message}
      </Alert>
    </Snackbar>
  );
};
