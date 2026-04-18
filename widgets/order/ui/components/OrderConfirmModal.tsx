import React from 'react';
import { useOrdersStore } from '@/entities/order/model/order.store';

export interface OrderConfirmModalProps {
  open: boolean;
  orderId: number | null;
  typeConfirm: string | null;
  onClose: () => void;
  onConfirm: () => void;
}

export const OrderConfirmModal: React.FC<OrderConfirmModalProps> = ({
  open,
  orderId,
  typeConfirm,
  onClose,
  onConfirm,
}) => {
  if (!open) return null;

  const getMessage = () => {
    switch (typeConfirm) {
      case 'finish':
        return `Завершить заказ #${orderId}?`;
      case 'cancel':
        return `Отменить заказ #${orderId}?`;
      case 'take':
        return `Взять заказ #${orderId}?`;
      case 'fake':
        return `Клиент не вышел на связь по заказу #${orderId}?`;
      default:
        return `Подтвердите действие для заказа #${orderId}`;
    }
  };

  return (
    <div className="modal-confirm" style={{ display: open ? 'flex' : 'none' }}>
      <div className="modal-confirm__content">
        <p>{getMessage()}</p>
        <div className="modal-confirm__actions">
          <button onClick={onConfirm}>Да</button>
          <button onClick={onClose}>Нет</button>
        </div>
      </div>
    </div>
  );
};
