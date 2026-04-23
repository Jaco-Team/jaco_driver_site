import React from 'react';
import Autocomplete from '@mui/material/Autocomplete';
import TextField from '@mui/material/TextField';
import { SxProps, Theme } from '@mui/material';

export interface AutocompleteOptionBase {
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
              fontSize,
            },
          }}
        />
      )}
      sx={{
        width: '100%',
        '& .MuiAutocomplete-inputRoot': {
          fontSize,
        },
        ...sx,
      }}
    />
  );
}
