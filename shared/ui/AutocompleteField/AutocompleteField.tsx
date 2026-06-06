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
  const optionFontSize = Math.min(Math.max(baseFontSize, 15), 22);
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
      slotProps={{
        paper: {
          elevation: 0,
          sx: {
            mt: '-2px',
            borderRadius: '0 0 22px 22px',
            border: '2px solid #42627d',
            borderTop: 'none',
            backgroundColor: '#ffffff',
            boxShadow: '0 22px 38px rgba(31, 43, 54, 0.16)',
            overflow: 'hidden',
          },
        },
        listbox: {
          sx: {
            maxHeight: 'min(56vh, 440px)',
            p: 0,
            overscrollBehavior: 'contain',
            '&::-webkit-scrollbar': {
              width: 6,
            },
            '&::-webkit-scrollbar-track': {
              backgroundColor: 'rgba(31, 43, 54, 0.04)',
            },
            '&::-webkit-scrollbar-thumb': {
              borderRadius: 999,
              backgroundColor: 'rgba(95, 109, 122, 0.36)',
            },
            '& .MuiAutocomplete-option': {
              minHeight: 58,
              px: 2,
              py: 1.35,
              borderBottom: '1px solid rgba(31, 43, 54, 0.08)',
              color: '#2f343a',
              fontSize: optionFontSize,
              lineHeight: 1.25,
              transition: 'background-color 0.16s ease, color 0.16s ease',
            },
            '& .MuiAutocomplete-option:last-of-type': {
              borderBottom: 'none',
            },
            '& .MuiAutocomplete-option.Mui-focused': {
              backgroundColor: '#f5f8fa',
            },
            '& .MuiAutocomplete-option[aria-selected="true"]': {
              backgroundColor: '#eef3f7',
              color: '#1f2b36',
              fontWeight: 600,
            },
            '& .MuiAutocomplete-option[aria-selected="true"].Mui-focused': {
              backgroundColor: '#e8eef3',
            },
          },
        },
        popper: {
          sx: {
            zIndex: 1300,
          },
        },
      }}
      renderInput={(params) => (
        <TextField
          {...params}
          variant="outlined"
          placeholder={placeholder}
          label={label}
          size="small"
          sx={{
            '& .MuiInputBase-root': {
              minHeight: 58,
              borderRadius: '18px',
              fontSize: textFontSize,
              backgroundColor: '#ffffff',
              color: '#1f2b36',
              boxShadow: '0 10px 20px rgba(31, 43, 54, 0.05)',
              transition:
                'border-radius 0.18s ease, box-shadow 0.18s ease, background-color 0.18s ease',
            },
            '& .MuiInputBase-input': {
              fontWeight: 600,
            },
            '& .MuiInputBase-input::placeholder': {
              color: '#8a94a0',
              opacity: 1,
              fontSize: placeholderFontSize,
            },
            '& .MuiOutlinedInput-notchedOutline': {
              borderColor: 'rgba(66, 98, 125, 0.22)',
              borderWidth: 1,
            },
            '& .MuiOutlinedInput-root:hover .MuiOutlinedInput-notchedOutline': {
              borderColor: 'rgba(66, 98, 125, 0.36)',
            },
            '& .MuiOutlinedInput-root.Mui-focused .MuiOutlinedInput-notchedOutline': {
              borderColor: '#42627d',
              borderWidth: 2,
            },
          }}
        />
      )}
      sx={{
        width: '100%',
        '& .MuiAutocomplete-inputRoot': {
          fontSize: textFontSize,
        },
        '&.Mui-expanded .MuiInputBase-root': {
          borderBottomLeftRadius: 0,
          borderBottomRightRadius: 0,
          boxShadow: '0 14px 26px rgba(31, 43, 54, 0.08)',
        },
        '&.Mui-expanded .MuiOutlinedInput-root.Mui-focused .MuiOutlinedInput-notchedOutline': {
          borderColor: '#42627d',
          borderBottomColor: 'transparent',
        },
        '& .MuiAutocomplete-popupIndicator, & .MuiAutocomplete-clearIndicator': {
          color: '#5f6d7a',
        },
        '& .MuiAutocomplete-popupIndicator': {
          mr: 0.4,
          transition: 'transform 0.18s ease',
        },
        '&.Mui-expanded .MuiAutocomplete-popupIndicator': {
          transform: 'rotate(180deg)',
        },
        '& .MuiAutocomplete-clearIndicator': {
          mr: 0.3,
        },
        ...sx,
      }}
    />
  );
}
