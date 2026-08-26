import React from 'react';
import Wheel from '@uiw/react-color-wheel';
import Alpha from '@uiw/react-color-alpha';
import { hsvaToHex, hexToHsva, HsvaColor, ColorResult } from '@uiw/color-convert';
import Paper from '@mui/material/Paper';
import Grid from '@mui/material/Grid';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import { SectionTitle } from '@/shared/ui/SectionTitle/SectionTitle';

interface ColorPickerProps {
  color: string;
  onChange: (color: string) => void;
  fontSize?: number;
}

/** Same Material 500 palette as the previous react-color CirclePicker. */
const PRESET_COLORS = [
  '#f44336',
  '#e91e63',
  '#9c27b0',
  '#673ab7',
  '#3f51b5',
  '#2196f3',
  '#03a9f4',
  '#00bcd4',
  '#009688',
  '#4caf50',
  '#8bc34a',
  '#cddc39',
  '#ffeb3b',
  '#ffc107',
  '#ff9800',
  '#ff5722',
  '#795548',
  '#607d8b',
];

export const ColorPicker: React.FC<ColorPickerProps> = ({ color, onChange, fontSize = 14 }) => {
  const [hsva, setHsva] = React.useState<HsvaColor>(hexToHsva(color));
  const baseFontSize = Number.isFinite(fontSize) && fontSize > 0 ? fontSize : 14;
  const helperFontSize = Math.min(Math.max(baseFontSize - 1, 12), 20);

  const applyColor = (next: ColorResult) => {
    setHsva(next.hsva);
    onChange(next.hex);
  };

  const handleAlphaChange = (newAlpha: { a: number }) => {
    setHsva((prev) => {
      const nextHsva = { ...prev, a: newAlpha.a };
      onChange(hsvaToHex(nextHsva));
      return nextHsva;
    });
  };

  return (
    <Grid size={12} sx={{ mt: '10px' }}>
      <Paper
        className="settingsCard settingsCard--picker"
        elevation={0}
        style={{ padding: 0, backgroundColor: 'transparent' }}
      >
        <SectionTitle title="Цвет на карте" fontSize={baseFontSize} />
        <Typography sx={{ fontSize: helperFontSize, color: 'text.secondary', mb: 1.4 }}>
          Текущий цвет: {color.toUpperCase()}
        </Typography>
        <Box className="settingsColorPreview" sx={{ mb: 2 }}>
          <Box
            sx={{
              width: 24,
              height: 24,
              borderRadius: '50%',
              border: '1px solid rgba(66, 98, 125, 0.28)',
              backgroundColor: color,
            }}
          />
          <Typography sx={{ fontSize: baseFontSize, color: 'text.primary', fontWeight: 600 }}>
            Выбранный оттенок
          </Typography>
        </Box>
        <Wheel color={color} onChange={applyColor} style={{ marginBottom: 28 }} />
        <Alpha hsva={hsva} width="92%" onChange={handleAlphaChange} style={{ marginBottom: 28 }} />
        <Box
          className="settingsColorPicker"
          sx={{
            display: 'flex',
            flexWrap: 'wrap',
            justifyContent: 'center',
            gap: '14px',
          }}
        >
          {PRESET_COLORS.map((preset) => {
            const selected = color.slice(0, 7).toLowerCase() === preset.toLowerCase();

            return (
              <Box
                key={preset}
                component="button"
                type="button"
                aria-label={preset}
                aria-pressed={selected}
                onClick={() => {
                  const nextHsva = { ...hexToHsva(preset), a: hsva.a };
                  setHsva(nextHsva);
                  onChange(hsvaToHex(nextHsva));
                }}
                sx={{
                  width: 28,
                  height: 28,
                  padding: 0,
                  borderRadius: '50%',
                  border: selected ? '2px solid #22303d' : '1px solid rgba(66, 98, 125, 0.28)',
                  backgroundColor: preset,
                  cursor: 'pointer',
                  boxShadow: selected ? '0 0 0 2px #fff' : 'none',
                }}
              />
            );
          })}
        </Box>
      </Paper>
    </Grid>
  );
};
