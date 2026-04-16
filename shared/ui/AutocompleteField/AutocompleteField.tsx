import React from 'react';
import Autocomplete, { AutocompleteValue } from '@mui/material/Autocomplete';
import TextField from '@mui/material/TextField';
import { SxProps, Theme } from '@mui/material';

export interface AutocompleteOption {
  id: number;
  name: string;
  [key: string]: unknown;
}

interface AutocompleteFieldProps {
  options: AutocompleteOption[];
  value: AutocompleteOption | null;
  onChange: (value: AutocompleteValue<unknown, false, false, false>) => void;
  placeholder?: string;
  label?: string;
  fontSize?: number;
  sx?: SxProps<Theme>;
  disabled?: boolean;
  getOptionLabel?: (option: AutocompleteOption | string) => string;
}

export const AutocompleteField: React.FC<AutocompleteFieldProps> = ({
  options,
  value,
  onChange,
  placeholder = 'Выберите...',
  label,
  fontSize = 14,
  sx,
  disabled = false,
  getOptionLabel: customGetOptionLabel,
}) => {
  const defaultGetOptionLabel = (option: AutocompleteOption | string) => {
    if (typeof option === 'object' && option !== null) {
      return option.name || String(option.id);
    }
    const found = options.find((p) => String(p.id) === String(option));
    return found?.name || String(option);
  };

  return (
    <Autocomplete
      multiple={false}
      options={options}
      getOptionLabel={customGetOptionLabel || defaultGetOptionLabel}
      isOptionEqualToValue={(option, value) => {
        if (!value) return false;
        const optionId = typeof option === 'object' ? option.id : option;
        const valueId = typeof value === 'object' ? value.id : value;
        return String(optionId) === String(valueId);
      }}
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
};
