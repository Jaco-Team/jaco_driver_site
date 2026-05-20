import React from 'react';
import FormGroup from '@mui/material/FormGroup';
import FormControlLabel from '@mui/material/FormControlLabel';
import Checkbox from '@mui/material/Checkbox';

interface CheckboxOption {
  label: string;
  value: boolean;
  onChange: (checked: boolean) => void;
}

interface CheckboxFieldProps {
  options: CheckboxOption[];
  fontSize?: number;
}

export const CheckboxField: React.FC<CheckboxFieldProps> = ({ options, fontSize = 14 }) => {
  const baseFontSize = Number.isFinite(fontSize) && fontSize > 0 ? fontSize : 14;
  const optionFontSize = Math.min(Math.max(baseFontSize, 14), 22);

  return (
    <FormGroup sx={{ gap: 0.4 }}>
      {options.map((option) => (
        <FormControlLabel
          key={option.label}
          control={
            <Checkbox
              checked={option.value}
              onClick={(e) => option.onChange((e.target as HTMLInputElement).checked)}
              sx={{
                color: 'rgba(66, 98, 125, 0.45)',
                '&.Mui-checked': {
                  color: '#cc0033',
                },
              }}
            />
          }
          label={option.label}
          sx={{
            marginLeft: 0,
            marginRight: 0,
            py: 0.3,
            borderRadius: '12px',
            transition: 'background-color 0.18s ease',
            '&:hover': {
              backgroundColor: 'rgba(66, 98, 125, 0.06)',
            },
            '& .MuiFormControlLabel-label': {
              fontSize: optionFontSize,
              color: '#2b3744',
              lineHeight: 1.32,
            },
          }}
        />
      ))}
    </FormGroup>
  );
};
