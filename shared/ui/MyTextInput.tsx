import TextField from '@mui/material/TextField';
import type { ChangeEvent, KeyboardEvent, ReactNode } from 'react';

interface MyTextInputProps {
  label?: string;
  value?: string | number;
  onChange?: (event: ChangeEvent<HTMLInputElement>) => void;
  onBlur?: (event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
  type?: string;
  onKeyPress?: (event: KeyboardEvent<HTMLInputElement>) => void;
  startAdornment?: ReactNode;
  endAdornment?: ReactNode;
  multiline?: boolean;
  rows?: number;
}

export default function MyTextInput({
  label,
  value,
  onChange,
  onBlur,
  type,
  onKeyPress,
  startAdornment,
  endAdornment,
  multiline,
  rows = 1,
}: MyTextInputProps) {
  return (
    <TextField
      label={label}
      value={value}
      onChange={onChange}
      onBlur={onBlur}
      variant="outlined"
      size="small"
      type={type}
      color="primary"
      multiline={multiline}
      rows={rows}
      style={{ width: '100%' }}
      slotProps={
        startAdornment || endAdornment
          ? {
              input: {
                startAdornment,
                endAdornment,
              },
            }
          : undefined
      }
      onKeyDown={(event: KeyboardEvent<HTMLInputElement>) => {
        if (onKeyPress && event.key === 'Enter') {
          onKeyPress(event);
        }
      }}
    />
  );
}
