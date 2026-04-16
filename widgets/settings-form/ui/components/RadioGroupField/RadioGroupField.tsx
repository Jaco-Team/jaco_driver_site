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
  return (
    <FormControl component="fieldset">
      <FormLabel component="legend" style={{ fontSize, color: 'rgba(0, 0, 0, 0.8)' }}>
        {label}
      </FormLabel>
      <RadioGroup value={value} onChange={(_, data) => onChange(data)}>
        {options.map((option) => (
          <FormControlLabel
            key={String(option.value)}
            value={option.value}
            control={<Radio />}
            label={option.label}
            sx={{
              '& .MuiFormControlLabel-label': { fontSize },
              '& .MuiButtonBase-root.MuiRadio-root.Mui-checked .MuiSvgIcon-root': {
                color: '#CC0033',
              },
            }}
          />
        ))}
      </RadioGroup>
    </FormControl>
  );
};
