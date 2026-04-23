import React from 'react';
import Slider from '@mui/material/Slider';
import Paper from '@mui/material/Paper';
import Grid from '@mui/material/Grid';

interface FontSizeSliderProps {
  value: number;
  onChange: (value: number) => void;
  fontSize?: number;
  min?: number;
  max?: number;
  step?: number;
}

export const FontSizeSlider: React.FC<FontSizeSliderProps> = ({
  value,
  onChange,
  fontSize = 14,
  min = 10,
  max = 40,
  step = 1,
}) => {
  return (
    <Grid size={12} style={{ marginTop: 10 }}>
      <Paper className="container_paper" elevation={5}>
        <div style={{ paddingBottom: '10px' }}>
          <span style={{ fontSize }}>Размер шрифта ({value})</span>
        </div>
        <div
          style={{
            display: 'flex',
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <span style={{ color: '#000', fontSize: '10px' }}>Ая</span>
          <span style={{ color: '#000', fontSize: value }}>Ая</span>
          <span style={{ color: '#000', fontSize: '40px' }}>Ая</span>
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
