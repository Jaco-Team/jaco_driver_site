import React from 'react';
import Slider from '@mui/material/Slider';
import Paper from '@mui/material/Paper';
import Grid from '@mui/material/Grid';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import { SectionTitle } from '@/shared/ui/SectionTitle/SectionTitle';

interface MapScaleSliderProps {
  value: number;
  onChange: (value: number) => void;
  fontSize?: number;
  min?: number;
  max?: number;
  step?: number;
}

export const MapScaleSlider: React.FC<MapScaleSliderProps> = ({
  value,
  onChange,
  fontSize = 14,
  min = 0.5,
  max = 1.3,
  step = 0.1,
}) => {
  const baseFontSize = Number.isFinite(fontSize) && fontSize > 0 ? fontSize : 14;
  const helperFontSize = Math.min(Math.max(baseFontSize - 1, 12), 20);

  return (
    <Grid size={12} sx={{ mt: '10px' }}>
      <Paper
        className="settingsCard settingsCard--slider"
        elevation={0}
        style={{ padding: 0, backgroundColor: 'transparent' }}
      >
        <SectionTitle title="Масштабирование иконок на карте" fontSize={baseFontSize} />
        <Typography sx={{ fontSize: helperFontSize, color: 'text.secondary', mb: 1.2 }}>
          Текущее значение: {value.toFixed(1)}
        </Typography>
        <Box sx={{ px: 0.6, pt: 0.6 }}>
          <Slider
            size="medium"
            value={value}
            valueLabelDisplay="off"
            step={step}
            max={max}
            min={min}
            color="info"
            onChange={(_, val) => onChange(val as number)}
          />
        </Box>
      </Paper>
    </Grid>
  );
};
