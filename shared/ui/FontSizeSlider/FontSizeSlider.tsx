import React from 'react';
import Slider from '@mui/material/Slider';
import Paper from '@mui/material/Paper';
import Grid from '@mui/material/Grid';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import { SectionTitle } from '@/shared/ui/SectionTitle/SectionTitle';

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
  const baseFontSize = Number.isFinite(fontSize) && fontSize > 0 ? fontSize : 14;
  const helperFontSize = Math.min(Math.max(baseFontSize - 1, 12), 20);
  const sampleSmallSize = Math.min(Math.max(value - 2, 12), 18);
  const sampleMediumSize = Math.min(Math.max(value, 14), 24);
  const sampleLargeSize = Math.min(Math.max(value + 4, 18), 32);

  return (
    <Grid size={12} sx={{ mt: '10px' }}>
      <Paper
        className="settingsCard settingsCard--slider"
        elevation={0}
        style={{ padding: 0, backgroundColor: 'transparent' }}
      >
        <SectionTitle title="Размер шрифта" fontSize={baseFontSize} />
        <Typography sx={{ fontSize: helperFontSize, color: '#6f7f8d', mb: 1.2 }}>
          Текущее значение: {value}
        </Typography>
        <Box className="settingsScalePreview">
          <Box className="settingsScalePreview__item">
            <span style={{ color: '#1f2b36', fontSize: 10, lineHeight: 1 }}>Ая</span>
            <span className="settingsScalePreview__caption">Меньше</span>
          </Box>
          <Box className="settingsScalePreview__item">
            <span style={{ color: '#1f2b36', fontSize: sampleMediumSize, lineHeight: 1 }}>Ая</span>
            <span className="settingsScalePreview__caption">Текущий</span>
          </Box>
          <Box className="settingsScalePreview__item">
            <span style={{ color: '#1f2b36', fontSize: 40, lineHeight: 1 }}>Ая</span>
            <span className="settingsScalePreview__caption">Больше</span>
          </Box>
        </Box>
        <Box sx={{ px: 0.6, pt: 0.3 }}>
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
