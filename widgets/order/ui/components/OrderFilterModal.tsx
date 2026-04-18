import React from 'react';
import { ORDER_STATUS_TYPES } from '@/entities/order/model/order.types';

export interface OrderFilterModalProps {
  open: boolean;
  selectedTypes: string[];
  onClose: () => void;
  onSave: (types: string[]) => void;
}

export const OrderFilterModal: React.FC<OrderFilterModalProps> = ({
  open,
  selectedTypes,
  onClose,
  onSave,
}) => {
  const [localTypes, setLocalTypes] = React.useState<string[]>(selectedTypes);

  if (!open) return null;

  const handleToggle = (typeId: string) => {
    setLocalTypes((prev) =>
      prev.includes(typeId) ? prev.filter((t) => t !== typeId) : [...prev, typeId]
    );
  };

  const handleSave = () => {
    onSave(localTypes);
    onClose();
  };

  return (
    <div className="modal-filter" style={{ display: open ? 'flex' : 'none' }}>
      <div className="modal-filter__content">
        <h3>Фильтр по статусам</h3>
        <div className="modal-filter__options">
          {ORDER_STATUS_TYPES.map((type) => (
            <label key={type.id}>
              <input
                type="checkbox"
                checked={localTypes.includes(String(type.id))}
                onChange={() => handleToggle(String(type.id))}
              />
              {type.text}
            </label>
          ))}
        </div>
        <div className="modal-filter__actions">
          <button onClick={handleSave}>Применить</button>
          <button onClick={onClose}>Отмена</button>
        </div>
      </div>
    </div>
  );
};
