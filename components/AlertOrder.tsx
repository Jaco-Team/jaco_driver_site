import { useOrdersStore } from '@/entities/order/model/order.store';
import { ErrorModal } from '@/shared/ui/ErrorModal/ErrorModal';

export default function AlertOrder() {
  // Единственное место показа ошибок заказа для списка, карты и других страниц.
  const showErrOrder = useOrdersStore((state) => state.showErrOrder);
  const textErrOrder = useOrdersStore((state) => state.textErrOrder);
  const closeErrOrder = useOrdersStore((state) => state.closeErrOrder);

  return <ErrorModal open={showErrOrder} errorText={textErrOrder} onClose={closeErrOrder} />;
}
