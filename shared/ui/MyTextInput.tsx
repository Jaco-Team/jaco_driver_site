import TextField from '@mui/material/TextField';
import type { ChangeEvent, KeyboardEvent } from 'react';

interface MyTextInputProps {
  label?: string;
  value?: string | number;
  onChange?: (event: ChangeEvent<HTMLInputElement>) => void;
  onBlur?: (event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
  type?: string;
  onKeyPress?: () => void;
}

export default function MyTextInput({
  label,
  value,
  onChange,
  onBlur,
  type,
  onKeyPress,
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
      onKeyDown={(event: KeyboardEvent<HTMLInputElement>) => {
        if (onKeyPress && event.key === 'Enter') {
          onKeyPress();
        }
      }}
    />
  );
}
