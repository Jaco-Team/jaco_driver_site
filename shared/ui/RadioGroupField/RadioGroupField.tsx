import React from 'react';
import FormControl from '@mui/material/FormControl';
import FormLabel from '@mui/material/FormLabel';
import RadioGroup from '@mui/material/RadioGroup';
import FormControlLabel from '@mui/material/FormControlLabel';
import Radio from '@mui/material/Radio';

interface RadioOption {
  value: string | number;
  label: string;
}

interface RadioGroupFieldProps {
  label: string;
  value: string | number;
  onChange: (value: string | number) => void;
  options: RadioOption[];
  fontSize?: number;
}

export const RadioGroupField: React.FC<RadioGroupFieldProps> = ({
  label,
  value,
  onChange,
  options,
  fontSize = 14,
}) => {
  const baseFontSize = Number.isFinite(fontSize) && fontSize > 0 ? fontSize : 14;
  const labelFontSize = Math.min(Math.max(baseFontSize + 1, 15), 24);
  const optionFontSize = Math.min(Math.max(baseFontSize, 14), 22);

  return (
    <FormControl component="fieldset" sx={{ width: '100%' }}>
      <FormLabel
        component="legend"
        sx={{
          fontSize: labelFontSize,
          color: 'text.primary',
          fontWeight: 700,
          lineHeight: 1.2,
          mb: 0.65,
          '&.Mui-focused': {
            color: 'text.primary',
          },
        }}
      >
        {label}
      </FormLabel>
      <RadioGroup value={value} onChange={(_, data) => onChange(data)} sx={{ gap: 0.4 }}>
        {options.map((option) => (
          <FormControlLabel
            key={String(option.value)}
            value={option.value}
            control={
              <Radio
                sx={{
                  color: 'text.secondary',
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
                backgroundColor: 'action.hover',
              },
              '& .MuiFormControlLabel-label': {
                fontSize: optionFontSize,
                color: 'text.primary',
                lineHeight: 1.32,
              },
            }}
          />
        ))}
      </RadioGroup>
    </FormControl>
  );
};
