import React from 'react';
import Slider from '@mui/material/Slider';
import Paper from '@mui/material/Paper';
import Grid from '@mui/material/Grid';

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
  return (
    <Grid size={12} style={{ marginTop: 10 }}>
      <Paper className="container_paper" elevation={5}>
        <div style={{ paddingBottom: '10px' }}>
          <span style={{ fontSize }}>Масштабирование иконок на карте ({value})</span>
        </div>
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
      </Paper>
    </Grid>
  );
};
