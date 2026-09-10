import FormControlLabel from '@mui/material/FormControlLabel';
import Switch from '@mui/material/Switch';

interface SwitchFieldProps {
  label: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
  fontSize?: number;
  disabled?: boolean;
}

export function SwitchField({
  label,
  checked,
  onChange,
  fontSize = 14,
  disabled = false,
}: SwitchFieldProps) {
  const normalizedFontSize = Number.isFinite(fontSize) && fontSize > 0 ? fontSize : 14;
  const labelFontSize = Math.min(Math.max(normalizedFontSize, 14), 22);

  return (
    <FormControlLabel
      disabled={disabled}
      control={
        <Switch
          checked={checked}
          onChange={(_, nextChecked) => onChange(nextChecked)}
          sx={{
            '& .MuiSwitch-switchBase.Mui-checked': {
              color: '#cc0033',
            },
            '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': {
              backgroundColor: '#cc0033',
            },
          }}
        />
      }
      label={label}
      sx={{
        width: '100%',
        margin: 0,
        justifyContent: 'space-between',
        gap: 1.5,
        '& .MuiFormControlLabel-label': {
          order: -1,
          flex: 1,
          color: 'text.primary',
          fontSize: labelFontSize,
          lineHeight: 1.32,
        },
      }}
    />
  );
}
