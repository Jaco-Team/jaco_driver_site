'use client';

import { useMemo, useState } from 'react';
import Box from '@mui/material/Box';
import ButtonBase from '@mui/material/ButtonBase';
import CircularProgress from '@mui/material/CircularProgress';
import SwipeableDrawer from '@mui/material/SwipeableDrawer';
import Typography from '@mui/material/Typography';
import { useTheme } from '@mui/material/styles';
import ChevronLeftRoundedIcon from '@mui/icons-material/ChevronLeftRounded';

import { getOrderUrgency } from '@/entities/order/model/orderMapGroups';
import type { Order } from '@/entities/order/model/order.types';
import { useOrdersStore } from '@/entities/order/model/order.store';
import { useHeaderStore } from '@/features/header/model/header.store';
import { roboto } from '@/shared/config/fonts';
import { OrderCard, ORDER_CARD_DELETED_BG } from '@/widgets/order/ui/components/OrderCard';

export function OrderMapDrawer() {
  const theme = useTheme();
  const isDarkTheme = theme.palette.mode === 'dark';
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
  const groupKey = useMemo(() => showOrders.map((item) => item.id).join(':'), [showOrders]);
  const [selection, setSelection] = useState<{ groupKey: string; orderId: number | null }>({
    groupKey: '',
    orderId: null,
  });
  const selectedOrderId = selection.groupKey === groupKey ? selection.orderId : null;
  const isGroup = showOrders.length > 1;
  const selectedOrder = showOrders.find((item) => item.id === selectedOrderId) ?? null;

  const actionsBusy = isClick || is_load;
  const sheetDeleted =
    showOrders.length > 0 && showOrders.every((item) => parseInt(`${item?.is_delete}`, 10) === 1);

  const closeDrawer = () => {
    if (actionsBusy) return;
    setSelection({ groupKey: '', orderId: null });
    closeOrderMap();
  };

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
      onClose={closeDrawer}
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
            background: sheetDeleted ? ORDER_CARD_DELETED_BG : theme.palette.background.paper,
            color: sheetDeleted ? '#fff' : theme.palette.text.primary,
            overflow: 'hidden',
            border: `1px solid ${theme.palette.divider}`,
            boxShadow: isDarkTheme
              ? '0 24px 44px rgba(0, 0, 0, 0.46)'
              : '0 24px 44px rgba(31, 43, 54, 0.2)',
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
            onClick={closeDrawer}
          >
            <Box
              sx={{
                width: 62,
                height: 6,
                borderRadius: 999,
                backgroundColor: isDarkTheme
                  ? 'rgba(243, 246, 248, 0.28)'
                  : 'rgba(31, 43, 54, 0.2)',
              }}
            />
          </Box>

          {isGroup && !selectedOrder ? (
            <OrderGroupList
              actionsBusy={actionsBusy}
              globalFontSize={globalFontSize}
              orders={showOrders}
              onSelect={(orderId) => setSelection({ groupKey, orderId })}
            />
          ) : null}

          {isGroup && selectedOrder ? (
            <ButtonBase
              data-testid="order-map-group-back"
              disabled={actionsBusy}
              onClick={() => setSelection({ groupKey, orderId: null })}
              sx={{
                alignSelf: 'flex-start',
                alignItems: 'center',
                border: `1px solid ${theme.palette.divider}`,
                borderRadius: '12px',
                backgroundColor: theme.palette.action.hover,
                color: theme.palette.text.primary,
                display: 'inline-flex',
                fontSize: globalFontSize,
                fontWeight: 600,
                gap: 0.75,
                justifyContent: 'center',
                px: 1.5,
                py: 1.1,
                mb: 0.25,
              }}
            >
              <ChevronLeftRoundedIcon
                aria-hidden
                data-testid="order-map-group-back-arrow"
                sx={{ display: 'block', fontSize: 20 }}
              />
              <Box
                component="span"
                data-testid="order-map-group-back-label"
                sx={{ lineHeight: 1.25 }}
              >
                Все заказы по адресу ({showOrders.length})
              </Box>
            </ButtonBase>
          ) : null}

          {(isGroup ? (selectedOrder ? [selectedOrder] : []) : showOrders).map((item) => (
            <OrderCard
              key={item.id}
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
              backgroundColor: isDarkTheme ? 'rgba(24, 35, 45, 0.72)' : 'rgba(255, 255, 255, 0.72)',
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

function OrderGroupList({
  actionsBusy,
  globalFontSize,
  orders,
  onSelect,
}: {
  actionsBusy: boolean;
  globalFontSize: number;
  orders: Order[];
  onSelect: (id: number) => void;
}) {
  const theme = useTheme();
  const sortedOrders = [...orders].sort(
    (left, right) => getOrderUrgency(left) - getOrderUrgency(right)
  );

  return (
    <Box data-testid="order-map-group-list" sx={{ pb: 0.75 }}>
      <Typography
        data-testid="order-map-group-title"
        sx={{
          color: 'text.primary',
          fontSize: globalFontSize + 4,
          fontWeight: 700,
          lineHeight: 1.35,
        }}
      >
        {getOrdersCountLabel(orders.length)} по адресу
      </Typography>
      <Typography
        data-testid="order-map-group-address"
        sx={{ color: 'text.secondary', fontSize: globalFontSize, mt: 0.25 }}
      >
        {orders[0]?.addr || 'Адрес не указан'}
      </Typography>

      <Box sx={{ display: 'grid', gap: 1.25, mt: 2 }}>
        {sortedOrders.map((item) => (
          <ButtonBase
            aria-label={`Открыть заказ ${item.id}`}
            data-testid={`order-map-group-order-${item.id}`}
            disabled={actionsBusy}
            key={item.id}
            onClick={() => onSelect(item.id)}
            sx={{
              alignItems: 'center',
              backgroundColor: theme.palette.background.paper,
              border: `1px solid ${theme.palette.divider}`,
              borderRadius: '16px',
              display: 'flex',
              gap: 1.25,
              justifyContent: 'space-between',
              minHeight: 76,
              px: 1.75,
              py: 1.5,
              textAlign: 'left',
              width: '100%',
              '&:hover': { backgroundColor: theme.palette.action.hover },
            }}
          >
            <Box sx={{ flex: 1, minWidth: 0 }}>
              <Box sx={{ alignItems: 'center', display: 'flex', gap: 1 }}>
                <Box
                  sx={{
                    backgroundColor: item.point_color || item.color || theme.palette.primary.main,
                    borderRadius: '50%',
                    flex: '0 0 auto',
                    height: 10,
                    width: 10,
                  }}
                />
                <Typography
                  noWrap
                  sx={{ color: 'text.primary', fontSize: globalFontSize, fontWeight: 700 }}
                >
                  {item.id_text || `#${item.id}`}
                </Typography>
              </Box>
              <Typography
                sx={{
                  color: 'text.secondary',
                  fontSize: Math.max(12, globalFontSize - 1),
                  mt: 0.5,
                }}
              >
                Пд: {item.pd || '—'} · Эт: {item.et || '—'} · Кв: {item.kv || '—'}
              </Typography>
            </Box>

            <Box sx={{ alignItems: 'center', display: 'flex', flex: '0 1 42%', gap: 0.75 }}>
              <Typography
                sx={{
                  color: 'text.primary',
                  fontSize: Math.max(12, globalFontSize - 1),
                  fontWeight: 600,
                }}
              >
                {item.point_text || item.to_time || ''}
              </Typography>
              <Typography aria-hidden sx={{ color: 'text.secondary', fontSize: 28, lineHeight: 1 }}>
                ›
              </Typography>
            </Box>
          </ButtonBase>
        ))}
      </Box>
    </Box>
  );
}

function getOrdersCountLabel(count: number): string {
  const mod100 = count % 100;
  const mod10 = count % 10;
  const noun =
    mod10 === 1 && mod100 !== 11
      ? 'заказ'
      : mod10 >= 2 && mod10 <= 4 && (mod100 < 12 || mod100 > 14)
        ? 'заказа'
        : 'заказов';

  return `${count} ${noun}`;
}
