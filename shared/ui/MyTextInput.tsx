import TextField from '@mui/material/TextField';
import type { ChangeEvent, KeyboardEvent, ReactNode } from 'react';

interface MyTextInputProps {
  label?: string;
  value?: string | number;
  onChange?: (event: ChangeEvent<HTMLInputElement>) => void;
  onBlur?: (event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
  type?: string;
  onKeyPress?: (event: KeyboardEvent<HTMLInputElement>) => void;
  endAdornment?: ReactNode;
}

export default function MyTextInput({
  label,
  value,
  onChange,
  onBlur,
  type,
  onKeyPress,
  endAdornment,
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
      style={{ width: '100%' }}
      InputProps={endAdornment ? { endAdornment } : undefined}
      onKeyDown={(event: KeyboardEvent<HTMLInputElement>) => {
        if (onKeyPress && event.key === 'Enter') {
          onKeyPress(event);
        }
      }}
    />
  );
}
