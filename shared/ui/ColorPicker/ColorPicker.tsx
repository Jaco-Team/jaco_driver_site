import React from 'react';
import { CirclePicker } from 'react-color';
import Wheel from '@uiw/react-color-wheel';
import Alpha from '@uiw/react-color-alpha';
import { hsvaToHex, hexToHsva, HsvaColor } from '@uiw/color-convert';
import Paper from '@mui/material/Paper';
import Grid from '@mui/material/Grid';

interface ColorPickerProps {
  color: string;
  onChange: (color: string) => void;
  fontSize?: number;
}

export const ColorPicker: React.FC<ColorPickerProps> = ({ color, onChange, fontSize = 14 }) => {
  const [hsva, setHsva] = React.useState<HsvaColor>(hexToHsva(color));

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
    <Grid size={12} style={{ marginTop: 10 }}>
      <Paper className="container_paper_picker" elevation={5}>
        <div style={{ paddingBottom: 30, alignSelf: 'flex-start' }}>
          <span style={{ fontSize }}>Цвет на карте</span>
        </div>
        <Wheel color={color} onChange={handleWheelChange} style={{ marginBottom: 40 }} />
        <Alpha hsva={hsva} width="90%" onChange={handleAlphaChange} style={{ marginBottom: 40 }} />
        <div className="container_picker">
          <CirclePicker width="100%" color={color} onChangeComplete={handleColorChange} />
        </div>
      </Paper>
    </Grid>
  );
};
