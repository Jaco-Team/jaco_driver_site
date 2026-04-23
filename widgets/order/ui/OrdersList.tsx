import React, { useCallback, memo } from 'react';
import Grid from '@mui/material/Grid';
import { OrderCard } from './components/OrderCard';
import { Order } from '@/entities/order/model/order.types';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';

export interface OrdersListProps {
  orders: Order[];
  globalFontSize: number;
  onOrderAction?: (action: string, orderId: number) => void;
  onOrderPay?: (orderId: number) => void;
}

const EmptyState: React.FC = () => (
  <Box
    sx={{
      textAlign: 'center',
      padding: '50px',
      width: '100%',
    }}
  >
    <Typography variant="body1" color="text.secondary">
      Нет заказов для отображения
    </Typography>
  </Box>
);

export const OrdersList: React.FC<OrdersListProps> = memo(
  ({ orders, globalFontSize, onOrderAction, onOrderPay }) => {
    const handleAction = useCallback(
      (action: string, orderId: number) => {
        onOrderAction?.(action, orderId);
      },
      [onOrderAction]
    );

    const handlePay = useCallback(
      (orderId: number) => {
        onOrderPay?.(orderId);
      },
      [onOrderPay]
    );

    if (!orders || orders.length === 0) {
      return <EmptyState />;
    }

    return (
      <Grid container spacing={2} className="list_orders" sx={{ mt: 0 }}>
        {orders.map((item) => (
          <Grid size={{ xs: 12, sm: 6, md: 4, lg: 3 }} key={item.id}>
            <OrderCard
              item={item}
              isMap={false}
              globalFontSize={globalFontSize}
              onAction={handleAction}
              onPay={handlePay}
            />
          </Grid>
        ))}
      </Grid>
    );
  }
);

OrdersList.displayName = 'OrdersList';
