import React, { useState } from 'react';
import Grid from '@mui/material/Grid';
import Button from '@mui/material/Button';
import { OrderStats } from './components/OrderStats';
import { OrderStatusModal } from './components/OrderStatusModal';

interface OrdersHeaderProps {
  typeText: string;
  limit: string;
  limitCount: string;
  globalFontSize: number;
  onOpenMenu: () => void;
}

export const OrdersHeader: React.FC<OrdersHeaderProps> = ({
  typeText,
  limit,
  limitCount,
  globalFontSize,
  onOpenMenu,
}) => {
  const [statusModalOpen, setStatusModalOpen] = useState(false);

  const handleFilterClick = () => {
    setStatusModalOpen(true);
  };

  const handleCloseStatusModal = () => {
    setStatusModalOpen(false);
  };

  return (
    <>
      <OrderStatusModal
        open={statusModalOpen}
        onClose={handleCloseStatusModal}
        globalFontSize={globalFontSize}
      />

      <Grid size={12}>
        <Button variant="text" onClick={handleFilterClick} style={{ fontSize: globalFontSize }}>
          {typeText}
        </Button>
      </Grid>

      <OrderStats limit={limit} limitCount={limitCount} globalFontSize={globalFontSize} />
    </>
  );
};
