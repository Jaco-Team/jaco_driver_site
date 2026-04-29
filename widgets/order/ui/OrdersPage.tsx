import React, { useCallback } from 'react';
import Grid from '@mui/material/Grid';
import CircularProgress from '@mui/material/CircularProgress';
import Meta from '@/components/meta';
import { roboto } from '@/shared/ui/Font';
import { useOrdersStore } from '@/entities/order/model/order.store';
import { useHeaderStore } from '@/features/header/model/header.store';
import { useOrdersPage } from '../model/useOrdersPage';
import { useOrdersAutoRefresh } from '../model/useOrdersAutoRefresh';
import { OrdersHeader } from './OrdersHeader';
import { OrdersList } from './OrdersList';
import { OrderConfirmModal } from './components/OrderConfirmModal';
import { OrdersFilterSheet } from './components/OrdersFilterSheet';
import { useSettingsStore } from '@/entities/settings';
import { ErrorModal } from '@/shared/ui/ErrorModal/ErrorModal';

export interface OrdersPageProps {
  onFilterOpen?: () => void;
}

export const OrdersPage: React.FC<OrdersPageProps> = ({ onFilterOpen }) => {
  const { isLoading, isAuth } = useOrdersPage();
  const globalFontSize = useHeaderStore((state: any) => state.globalFontSize);
  const pointId = useSettingsStore((state: any) => state.pointId);

  const {
    orders,
    type,
    setOpenMenu,
    limit,
    limit_count,
    modalConfirm,
    order_finish_id,
    type_confirm,
    setActiveConfirm,
    actionFinishOrder,
    actionCencelOrder,
    actionGetOrder,
    actionFakeOrder,
    is_load,
    showErrOrder,
    textErrOrder,
    closeErrOrder,
  } = useOrdersStore((state: any) => ({
    orders: state.orders,
    type: state.type,
    setOpenMenu: state.setOpenMenu,
    limit: state.limit,
    limit_count: state.limit_count,
    modalConfirm: state.modalConfirm,
    order_finish_id: state.order_finish_id,
    type_confirm: state.type_confirm,
    setActiveConfirm: state.setActiveConfirm,
    actionFinishOrder: state.actionFinishOrder,
    actionCencelOrder: state.actionCencelOrder,
    actionGetOrder: state.actionGetOrder,
    actionFakeOrder: state.actionFakeOrder,
    is_load: state.is_load,
    showErrOrder: state.showErrOrder,
    textErrOrder: state.textErrOrder,
    closeErrOrder: state.closeErrOrder,
  }));

  useOrdersAutoRefresh({ isEnabled: isAuth === true });

  const handleOrderAction = useCallback(
    (action: string, orderId: number) => {
      switch (action) {
        case 'take':
          setActiveConfirm(true, orderId, false, 'take', null);
          break;
        case 'cancel':
          setActiveConfirm(true, orderId, false, 'cancel', null);
          break;
        case 'finish':
          setActiveConfirm(true, orderId, false, 'finish', null);
          break;
        case 'fake':
          setActiveConfirm(true, orderId, false, 'fake', null);
          break;
        default:
          console.warn(`Unknown action: ${action}`);
      }
    },
    [setActiveConfirm]
  );

  const handleConfirm = useCallback(() => {
    if (!order_finish_id) return;

    switch (type_confirm) {
      case 'finish':
        actionFinishOrder(order_finish_id);
        break;
      case 'cancel':
        actionCencelOrder(order_finish_id);
        break;
      case 'take':
        actionGetOrder(order_finish_id);
        break;
      case 'fake':
        actionFakeOrder(order_finish_id);
        break;
      default:
        console.warn(`Unknown confirm type: ${type_confirm}`);
    }
  }, [
    order_finish_id,
    type_confirm,
    actionFinishOrder,
    actionCencelOrder,
    actionGetOrder,
    actionFakeOrder,
  ]);

  const handleCloseModal = useCallback(() => {
    setActiveConfirm(false, null, false, null, null);
  }, [setActiveConfirm]);

  if (isLoading) {
    return (
      <Meta title="Список заказов">
        <div
          style={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            height: '50vh',
          }}
        >
          <CircularProgress />
        </div>
      </Meta>
    );
  }

  return (
    <Meta title="Список заказов">
      <Grid
        container
        spacing={3}
        className={'list ' + roboto.variable}
        style={{ display: 'flex', justifyContent: 'center' }}
      >
        <OrdersHeader
          typeText={type?.text || 'Заказы'}
          limit={limit || ''}
          limitCount={limit_count || ''}
          globalFontSize={globalFontSize}
          onOpenMenu={setOpenMenu}
        />

        {is_load ? (
          <Grid size={12} style={{ textAlign: 'center', padding: '50px' }}>
            <CircularProgress />
          </Grid>
        ) : (
          <OrdersList
            orders={orders}
            globalFontSize={globalFontSize}
            onOrderAction={handleOrderAction}
          />
        )}
      </Grid>

      <OrderConfirmModal
        open={modalConfirm}
        orderId={order_finish_id}
        typeConfirm={type_confirm}
        onClose={handleCloseModal}
        onConfirm={handleConfirm}
      />

      <ErrorModal open={showErrOrder} errorText={textErrOrder} onClose={closeErrOrder} />
      <OrdersFilterSheet />
    </Meta>
  );
};
