import React from 'react';
import Grid from '@mui/material/Grid';
import { OrderFilters } from './components/OrderFilters';
import { OrderStats } from './components/OrderStats';
import { ModalFilterOrders } from '@/components/ModalFilterOrders';

export interface OrdersHeaderProps {
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
  return (
    <>
      <ModalFilterOrders />
      <OrderFilters typeText={typeText} globalFontSize={globalFontSize} onOpenMenu={onOpenMenu} />
      <OrderStats limit={limit} limitCount={limitCount} globalFontSize={globalFontSize} />
    </>
  );
};
