import React from 'react';
import Autocomplete from '@mui/material/Autocomplete';
import TextField from '@mui/material/TextField';
import { SxProps, Theme } from '@mui/material';

interface AutocompleteOptionBase {
  id: number;
  name: string;
}

interface AutocompleteFieldProps<TOption extends AutocompleteOptionBase> {
  options: TOption[];
  value: TOption | null;
  onChange: (value: TOption | null) => void;
  placeholder?: string;
  label?: string;
  fontSize?: number;
  sx?: SxProps<Theme>;
  disabled?: boolean;
  getOptionLabel?: (option: TOption) => string;
}

export function AutocompleteField<TOption extends AutocompleteOptionBase>({
  options,
  value,
  onChange,
  placeholder = 'Выберите...',
  label,
  fontSize = 14,
  sx,
  disabled = false,
  getOptionLabel: customGetOptionLabel,
}: AutocompleteFieldProps<TOption>) {
  const baseFontSize = Number.isFinite(fontSize) && fontSize > 0 ? fontSize : 14;
  const textFontSize = Math.min(Math.max(baseFontSize, 14), 22);
  const placeholderFontSize = Math.min(Math.max(baseFontSize - 1, 12), 20);
  const defaultGetOptionLabel = (option: TOption) => option.name || String(option.id);

  return (
    <Autocomplete
      multiple={false}
      options={options}
      getOptionLabel={customGetOptionLabel || defaultGetOptionLabel}
      isOptionEqualToValue={(option, selected) => String(option.id) === String(selected.id)}
      value={value}
      onChange={(_, newValue) => onChange(newValue)}
      disabled={disabled}
      renderInput={(params) => (
        <TextField
          {...params}
          variant="outlined"
          placeholder={placeholder}
          label={label}
          size="small"
          sx={{
            '& .MuiInputBase-root': {
              minHeight: 52,
              borderRadius: '14px',
              fontSize: textFontSize,
              backgroundColor: '#ffffff',
            },
            '& .MuiInputBase-input::placeholder': {
              color: '#8a94a0',
              opacity: 1,
              fontSize: placeholderFontSize,
            },
            '& .MuiOutlinedInput-notchedOutline': {
              borderColor: 'rgba(66, 98, 125, 0.22)',
            },
            '& .MuiOutlinedInput-root:hover .MuiOutlinedInput-notchedOutline': {
              borderColor: 'rgba(66, 98, 125, 0.36)',
            },
            '& .MuiOutlinedInput-root.Mui-focused .MuiOutlinedInput-notchedOutline': {
              borderColor: '#42627d',
            },
          }}
        />
      )}
      sx={{
        width: '100%',
        '& .MuiAutocomplete-inputRoot': {
          fontSize: textFontSize,
        },
        '& .MuiAutocomplete-popupIndicator, & .MuiAutocomplete-clearIndicator': {
          color: '#5f6d7a',
        },
        ...sx,
      }}
    />
  );
}
