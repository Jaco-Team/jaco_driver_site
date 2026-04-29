import React from 'react';
import Button from '@mui/material/Button';
import Grid from '@mui/material/Grid';

interface OrderFiltersProps {
  typeText: string;
  globalFontSize: number;
  onOpenMenu: () => void;
}

const OrderFilters: React.FC<OrderFiltersProps> = ({ typeText, globalFontSize, onOpenMenu }) => {
  return (
    <Grid size={12}>
      <Button variant="text" onClick={onOpenMenu} style={{ fontSize: globalFontSize }}>
        {typeText}
      </Button>
    </Grid>
  );
};
