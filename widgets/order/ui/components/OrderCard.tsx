import React from 'react';
import { Order } from '@/entities/order/model/order.types';

export interface OrderCardProps {
  item: Order;
  isMap?: boolean;
  globalFontSize: number;
  onAction?: (action: string, orderId: number) => void;
}

export const OrderCard: React.FC<OrderCardProps> = ({
  item,
  isMap = false,
  globalFontSize,
  onAction,
}) => {
  return (
    <div className="order-card" style={{ fontSize: globalFontSize }}>
      <div className="order-card__id">Заказ #{item.id}</div>
      <div className="order-card__status">{item.status}</div>
      <div className="order-card__address">
        {item.pd} {item.et} {item.kv}
      </div>
      <div className="order-card__comment">{item.comment}</div>
      {item.drink_list && item.drink_list.length > 0 && (
        <div className="order-card__drinks">
          {item.drink_list.map((drink, idx) => (
            <div key={idx}>
              {drink.name} x{drink.count}
            </div>
          ))}
        </div>
      )}
      {!isMap && onAction && (
        <div className="order-card__actions">
          <button onClick={() => onAction('take', item.id)}>Взять</button>
          <button onClick={() => onAction('cancel', item.id)}>Отменить</button>
          <button onClick={() => onAction('finish', item.id)}>Завершить</button>
        </div>
      )}
    </div>
  );
};
