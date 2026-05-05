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
  const inputProps: any = {};

  if (startAdornment || endAdornment) {
    inputProps.InputProps = {};
    if (startAdornment) {
      inputProps.InputProps.startAdornment = startAdornment;
    }
    if (endAdornment) {
      inputProps.InputProps.endAdornment = endAdornment;
    }
  }

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
      {...inputProps}
      onKeyDown={(event: KeyboardEvent<HTMLInputElement>) => {
        if (onKeyPress && event.key === 'Enter') {
          onKeyPress(event);
        }
      }}
    />
  );
}
