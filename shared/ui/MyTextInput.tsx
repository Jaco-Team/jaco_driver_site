import TextField from '@mui/material/TextField';
import type { ChangeEvent, KeyboardEvent, ReactNode } from 'react';

interface MyTextInputProps {
  label?: string;
  disabled?: boolean;
  value?: string | number;
  onChange?: (event: ChangeEvent<HTMLInputElement>) => void;
  onBlur?: (event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
  type?: string;
  onKeyPress?: (event: KeyboardEvent<HTMLInputElement>) => void;
  startAdornment?: ReactNode;
  endAdornment?: ReactNode;
  multiline?: boolean;
  rows?: number;
  maxLength?: number;
  inputMode?: 'text' | 'numeric' | 'tel';
  placeholder?: string;
  name?: string;
  autoComplete?: string;
  ariaLabel?: string;
}

export default function MyTextInput({
  label,
  disabled,
  value,
  onChange,
  onBlur,
  type,
  onKeyPress,
  startAdornment,
  endAdornment,
  multiline,
  rows = 1,
  maxLength,
  inputMode,
  placeholder,
  name,
  autoComplete,
  ariaLabel,
}: MyTextInputProps) {
  return (
    <TextField
      label={label}
      disabled={disabled}
      placeholder={placeholder}
      name={name}
      autoComplete={autoComplete}
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
      slotProps={{
        htmlInput: {
          maxLength,
          inputMode,
          'aria-label': ariaLabel,
        },
        ...(startAdornment || endAdornment
          ? {
              input: {
                startAdornment,
                endAdornment,
              },
            }
          : {}),
      }}
      onKeyDown={(event: KeyboardEvent<HTMLInputElement>) => {
        if (onKeyPress && event.key === 'Enter') {
          onKeyPress(event);
        }
      }}
    />
  );
}
