'use client';

import Box from '@mui/material/Box';
import CircularProgress from '@mui/material/CircularProgress';
import SwipeableDrawer from '@mui/material/SwipeableDrawer';

import { useOrdersStore } from '@/entities/order/model/order.store';
import { useHeaderStore } from '@/features/header/model/header.store';
import { roboto } from '@/shared/config/fonts';
import { OrderCard, ORDER_CARD_DELETED_BG } from '@/widgets/order/ui/components/OrderCard';

export function OrderMapDrawer() {
  const globalFontSize = useHeaderStore((state) => state.globalFontSize);
  const {
    isOpenOrderMap,
    closeOrderMap,
    showOrders,
    setActiveConfirm,
    actionGetOrder,
    actionPayOrder,
    isClick,
    is_load,
  } = useOrdersStore((state) => ({
    isOpenOrderMap: state.isOpenOrderMap,
    closeOrderMap: state.closeOrderMap,
    showOrders: state.showOrders,
    setActiveConfirm: state.setActiveConfirm,
    actionGetOrder: state.actionGetOrder,
    actionPayOrder: state.actionPayOrder,
    isClick: state.isClick,
    is_load: state.is_load,
  }));

  const actionsBusy = isClick || is_load;
  const sheetDeleted =
    showOrders.length > 0 &&
    showOrders.every((item: { is_delete?: unknown }) => parseInt(`${item?.is_delete}`, 10) === 1);

  const handleAction = (action: string, orderId: number) => {
    if (actionsBusy) return;

    if (action === 'take') {
      actionGetOrder(orderId, true);
      return;
    }

    setActiveConfirm(true, orderId, true, action, null);
  };

  return (
    <SwipeableDrawer
      anchor="bottom"
      open={isOpenOrderMap}
      onClose={() => {
        if (actionsBusy) return;
        closeOrderMap();
      }}
      onOpen={() => {}}
      disableSwipeToOpen
      data-testid="order-map-drawer"
      className={`modalOrderMap ${roboto.variable}`}
      slotProps={{
        paper: {
          'data-testid': 'order-map-drawer-paper',
          sx: {
            borderTopLeftRadius: 28,
            borderTopRightRadius: 28,
            maxHeight: '75vh',
            height: 'auto',
            bottom: 0,
            top: 'auto',
            background: sheetDeleted ? ORDER_CARD_DELETED_BG : '#ffffff',
            overflow: 'hidden',
            border: '1px solid rgba(66, 98, 125, 0.14)',
            boxShadow: '0 24px 44px rgba(31, 43, 54, 0.2)',
          },
        } as any,
      }}
    >
      <Box sx={{ position: 'relative' }}>
        <Box
          sx={{
            px: 2.5,
            pt: 1.15,
            pb: 'calc(env(safe-area-inset-bottom, 0px) + 14px)',
            maxHeight: '75vh',
            overflowY: 'auto',
          }}
        >
          <Box
            sx={{
              width: '100%',
              display: 'flex',
              justifyContent: 'center',
              pb: 1.25,
              cursor: actionsBusy ? 'default' : 'pointer',
            }}
            data-testid="order-map-drawer-handle"
            onClick={() => {
              if (actionsBusy) return;
              closeOrderMap();
            }}
          >
            <Box
              sx={{
                width: 62,
                height: 6,
                borderRadius: 999,
                backgroundColor: 'rgba(31, 43, 54, 0.2)',
              }}
            />
          </Box>

          {showOrders.map((item: unknown, index: number) => (
            <OrderCard
              key={index}
              item={item}
              is_map
              globalFontSize={globalFontSize}
              actionsDisabled={actionsBusy}
              onAction={handleAction}
              onPay={(orderId) => {
                if (actionsBusy) return;
                actionPayOrder(orderId, true);
              }}
            />
          ))}
        </Box>

        {actionsBusy ? (
          <Box
            data-testid="order-map-drawer-spinner"
            sx={{
              position: 'absolute',
              inset: 0,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              backgroundColor: 'rgba(255, 255, 255, 0.72)',
              zIndex: 2,
            }}
          >
            <CircularProgress />
          </Box>
        ) : null}
      </Box>
    </SwipeableDrawer>
  );
}
