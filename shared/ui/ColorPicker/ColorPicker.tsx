import React from 'react';
import { CirclePicker } from 'react-color';
import Wheel from '@uiw/react-color-wheel';
import Alpha from '@uiw/react-color-alpha';
import { hsvaToHex, hexToHsva, HsvaColor } from '@uiw/color-convert';
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

export const ColorPicker: React.FC<ColorPickerProps> = ({ color, onChange, fontSize = 14 }) => {
  const [hsva, setHsva] = React.useState<HsvaColor>(hexToHsva(color));
  const baseFontSize = Number.isFinite(fontSize) && fontSize > 0 ? fontSize : 14;
  const helperFontSize = Math.min(Math.max(baseFontSize - 1, 12), 20);

  const handleColorChange = (newColor: { hex: string }) => {
    const newHsva = hexToHsva(newColor.hex);
    setHsva(newHsva);
    onChange(newColor.hex);
  };

  const handleWheelChange = (c: { hsva: HsvaColor; hex: string }) => {
    setHsva(c.hsva);
    onChange(c.hex);
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
        <Typography sx={{ fontSize: helperFontSize, color: '#6f7f8d', mb: 1.4 }}>
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
          <Typography sx={{ fontSize: baseFontSize, color: '#22303d', fontWeight: 600 }}>
            Выбранный оттенок
          </Typography>
        </Box>
        <Wheel color={color} onChange={handleWheelChange} style={{ marginBottom: 28 }} />
        <Alpha hsva={hsva} width="92%" onChange={handleAlphaChange} style={{ marginBottom: 28 }} />
        <div className="settingsColorPicker">
          <CirclePicker width="100%" color={color} onChangeComplete={handleColorChange} />
        </div>
      </Paper>
    </Grid>
  );
};
