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
  return (
    <FormGroup>
      {options.map((option) => (
        <FormControlLabel
          key={option.label}
          control={
            <Checkbox
              checked={option.value}
              onClick={(e) => option.onChange((e.target as HTMLInputElement).checked)}
            />
          }
          label={option.label}
          sx={{
            '& .MuiFormControlLabel-label': { fontSize },
            '& .MuiButtonBase-root.MuiRadio-root.Mui-checked .MuiSvgIcon-root': {
              color: '#CC0033',
            },
          }}
        />
      ))}
    </FormGroup>
  );
};
