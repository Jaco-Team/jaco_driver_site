import React from 'react';
import Grid from '@mui/material/Grid';
import { OrderCard } from './components/OrderCard';
import { Order } from '@/entities/order/model/order.types';

export interface OrdersListProps {
  orders: Order[];
  globalFontSize: number;
  onOrderAction?: (action: string, orderId: number) => void;
}

export const OrdersList: React.FC<OrdersListProps> = ({
  orders,
  globalFontSize,
  onOrderAction,
}) => {
  if (!orders.length) {
    return <div className="orders-list__empty">Нет заказов для отображения</div>;
  }

  return (
    <Grid container spacing={3} className="list_orders">
      {orders.map((item, key) => (
        <Grid size={{ xs: 12, sm: 3 }} key={key} style={{ paddingLeft: 0 }}>
          <OrderCard
            key={item.id || key}
            item={item}
            isMap={false}
            globalFontSize={globalFontSize}
            onAction={onOrderAction}
          />
        </Grid>
      ))}
    </Grid>
  );
};
