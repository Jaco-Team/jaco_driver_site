import AutoAwesomeRoundedIcon from '@mui/icons-material/AutoAwesomeRounded';
import CloseRoundedIcon from '@mui/icons-material/CloseRounded';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import CircularProgress from '@mui/material/CircularProgress';
import IconButton from '@mui/material/IconButton';
import { useRouter } from 'next/router';
import { useEffect, useMemo, useState } from 'react';

import { log } from '@/components/analytics';
import { useOrdersStore } from '@/entities/order/model/order.store';
import { normalizeBooleanSetting, useSettingsStore } from '@/entities/settings';
import type { Order } from '@/entities/order/model/order.types';
import { useConnectivityStore } from '@/features/offline/model/connectivity.store';
import { getApiErrorInfo } from '@/shared/api/errors';
import { readDriverPosition } from '@/shared/lib/geolocation';
import { SnackbarNotification } from '@/shared/ui/SnackbarNotification/SnackbarNotification';
import {
  subscribeOrderTakeStarted,
  subscribeSuccessfulOrderAction,
} from '@/shared/lib/orderActionEvents';

import { requestOrderRecommendation } from '../api/orderRecommendation.api';
import { buildOrderRecommendationRequest } from '../model/buildOrderRecommendationRequest';
import { toRecommendationCoordinates } from '../model/recommendationCoordinates';
import {
  type OrderRecommendationSurface,
  useOrderRecommendationStore,
} from '../model/orderRecommendation.store';
import { buildOrderRecommendationSignature } from '../model/orderRecommendationSignature';
import { OrderRecommendationDrawer } from './OrderRecommendationDrawer';
import { NoSuitableOrdersDrawer } from './NoSuitableOrdersDrawer';

interface OrderRecommendationControlProps {
  orders: Order[];
  pointId: number | null;
  limit: string;
  limitCount: string;
  globalFontSize: number;
  orderTypeId: number;
  disabled?: boolean;
  surface?: OrderRecommendationSurface;
}

function clampFontSize(value: number, min: number, max: number) {
  return Math.min(Math.max(value, min), max);
}

export function OrderRecommendationControl({ ...props }: OrderRecommendationControlProps) {
  const aiRecommendEnabled = useSettingsStore((state) =>
    normalizeBooleanSetting(state.settings?.ai_recommend)
  );
  const reset = useOrderRecommendationStore((state) => state.reset);

  useEffect(() => {
    if (!aiRecommendEnabled) reset();
  }, [aiRecommendEnabled, reset]);

  if (!aiRecommendEnabled) return null;

  return <EnabledOrderRecommendationControl {...props} />;
}

function EnabledOrderRecommendationControl({
  orders,
  pointId,
  limit,
  limitCount,
  globalFontSize,
  orderTypeId,
  disabled: disabledByPage = false,
  surface = 'list',
}: OrderRecommendationControlProps) {
  const router = useRouter();
  const isOnline = useConnectivityStore((state) => state.isOnline);
  const ordersByContext = useOrdersStore((state) => state.ordersByContext);
  const sourceOrders = useOrdersStore((state) => state.sourceOrders);
  const [error, setError] = useState('');
  const [isNoSuitableOpen, setIsNoSuitableOpen] = useState(false);
  const {
    acceptedOrderIds,
    applySuccessfulOrderAction,
    cancelPending,
    close,
    finish,
    isLoading,
    isOpen: storeIsOpen,
    isRouteVisible,
    open,
    orderTypeId: resultOrderTypeId,
    presenter,
    reconcileOrders,
    reset,
    result,
    orderSnapshots,
    start,
    succeed,
    unavailableOrderIds,
  } = useOrderRecommendationStore();
  const recommendationOrders = useMemo(
    () =>
      sourceOrders.filter(
        (order) => Number(order.is_delete ?? 0) !== 1 && Number(order.status_order ?? 0) !== 6
      ),
    [sourceOrders]
  );
  const hasCurrentResult = Boolean(result && resultOrderTypeId === orderTypeId);
  const isMap = surface === 'map';
  const isOpen = storeIsOpen && presenter === surface && hasCurrentResult;
  const displayOrders = useMemo(() => {
    const merged = new Map<number, Order>(
      Object.values(orderSnapshots).map((order) => [order.id, order])
    );
    orders.forEach((order) => merged.set(order.id, order));
    return [...merged.values()];
  }, [orderSnapshots, orders]);

  useEffect(
    () =>
      subscribeSuccessfulOrderAction(({ orderId, type }) => {
        applySuccessfulOrderAction(orderId, type);
      }),
    [applySuccessfulOrderAction]
  );

  useEffect(() => subscribeOrderTakeStarted(() => cancelPending()), [cancelPending]);

  useEffect(() => {
    const myOrderIds = Object.values(ordersByContext)
      .flat()
      .filter((order) => Number(order.is_my ?? 0) === 1)
      .map((order) => order.id);
    const availableOrderIds = sourceOrders
      .filter(
        (order) =>
          Number(order.is_my ?? 0) !== 1 &&
          Number(order.is_get ?? 0) !== 1 &&
          Number(order.is_delete ?? 0) !== 1 &&
          Number(order.status_order ?? 0) !== 6
      )
      .map((order) => order.id);
    reconcileOrders(availableOrderIds, myOrderIds);
  }, [ordersByContext, reconcileOrders, sourceOrders]);

  const handleRequest = async () => {
    if (isLoading || disabledByPage || !isOnline) return;
    if (!hasCurrentResult && recommendationOrders.length === 0) return;

    if (isMap && hasCurrentResult && isRouteVisible && resultOrderTypeId === orderTypeId) {
      open(surface);
      log('order_recommendation_opened', 'Открыта готовая ИИ-подсказка');
      return;
    }

    if (hasCurrentResult) {
      useOrderRecommendationStore.getState().showRoute();
      log('order_recommendation_map_opened', 'Повторно показан ИИ-маршрут');
      if (!isMap) await router.push('/map_orders');
      return;
    }

    const orderState = useOrdersStore.getState();
    const analysisOrders = orderState.sourceOrders.filter(
      (order) => Number(order.is_delete ?? 0) !== 1 && Number(order.status_order ?? 0) !== 6
    );
    if (analysisOrders.length === 0) return;

    const requestVersion = start();
    orderState.setTypeDop(orderState.types_dop.map((status) => String(status.id)));
    orderState.showModalTypeDop(false);
    const isCurrentRequest = () =>
      useOrderRecommendationStore.getState().requestVersion === requestVersion;
    setError('');
    setIsNoSuitableOpen(false);
    log('order_recommendation_requested', 'Запрошен совет по заказам');

    try {
      const position = await readDriverPosition();
      if (!isCurrentRequest()) return;
      const courier = toRecommendationCoordinates(position.latitude, position.longitude);
      const payload = buildOrderRecommendationRequest({
        orders: analysisOrders,
        pointId,
        limit,
        limitCount,
        courier,
      });
      const response = await requestOrderRecommendation(payload);
      if (!isCurrentRequest()) return;

      if (
        response.code === 'no_suitable_orders' ||
        (response.st && (response.take?.length ?? 0) === 0)
      ) {
        setIsNoSuitableOpen(true);
        return;
      }

      if (!response.st) {
        throw new Error(response.text || 'Не удалось получить совет по заказам.');
      }

      succeed(
        requestVersion,
        response,
        buildOrderRecommendationSignature({ orders: analysisOrders, pointId, limit, limitCount }),
        surface,
        orderTypeId,
        analysisOrders
      );
      log('order_recommendation_map_opened', 'Построен ИИ-маршрут по заказам');
      if (!isMap) await router.push('/map_orders');
    } catch (requestError) {
      if (!isCurrentRequest()) return;
      const apiError = getApiErrorInfo(requestError);
      const isTechnicalError =
        apiError.status === null ||
        apiError.status >= 500 ||
        /internal server error|request failed|network error|timeout|socket hang up/i.test(
          apiError.message
        );
      setError(
        isTechnicalError
          ? 'Не удалось подобрать маршрут. Попробуйте ещё раз.'
          : apiError.message || 'Не удалось подобрать маршрут. Попробуйте ещё раз.'
      );
    } finally {
      finish(requestVersion);
    }
  };

  const disabled = isLoading || disabledByPage;
  const label = isLoading ? 'Анализ заказов…' : hasCurrentResult ? 'Подробнее' : 'Помочь с выбором';

  return (
    <>
      {isOnline && (recommendationOrders.length > 0 || hasCurrentResult) && (
        <Box
          className={isMap ? 'orders-map-ai-control' : undefined}
          sx={{
            width: '100%',
            display: 'flex',
            gap: isMap && isRouteVisible && resultOrderTypeId === orderTypeId ? 1 : 0,
          }}
        >
          <Button
            fullWidth
            aria-label={isMap && isRouteVisible ? 'Подробнее' : label}
            variant="contained"
            disableElevation
            disabled={disabled}
            onClick={handleRequest}
            startIcon={
              isLoading ? (
                <CircularProgress size={20} color="inherit" />
              ) : (
                <AutoAwesomeRoundedIcon />
              )
            }
            sx={{
              minHeight: isMap ? 44 : 48,
              borderRadius: isMap ? '14px' : '16px',
              px: isMap ? 1.5 : 2,
              textTransform: 'none',
              whiteSpace: 'nowrap',
              fontSize: clampFontSize(globalFontSize, 14, isMap ? 16 : 18),
              fontWeight: 750,
              color: 'primary.contrastText',
              backgroundColor: 'primary.main',
              '&:hover': { backgroundColor: 'primary.main' },
              '&.Mui-disabled': {
                color: '#FFFFFF',
                backgroundColor: 'primary.main',
                opacity: 1,
              },
            }}
          >
            {label}
          </Button>
          {isMap && isRouteVisible && resultOrderTypeId === orderTypeId && (
            <IconButton
              aria-label="Сбросить рекомендации"
              onClick={reset}
              sx={{
                width: 44,
                height: 44,
                flex: '0 0 44px',
                borderRadius: '14px',
                color: 'primary.contrastText',
                backgroundColor: 'primary.main',
                '&:hover': { backgroundColor: 'primary.main' },
              }}
            >
              <CloseRoundedIcon />
            </IconButton>
          )}
        </Box>
      )}

      {isMap ? (
        <OrderRecommendationDrawer
          open={isOpen}
          result={result}
          orders={displayOrders}
          acceptedOrderIds={acceptedOrderIds}
          unavailableOrderIds={unavailableOrderIds}
          orderTypeId={orderTypeId}
          showMapAction={false}
          onShowOnMap={() => {
            useOrderRecommendationStore.getState().showRoute();
            close();
          }}
          onClose={close}
        />
      ) : null}

      <NoSuitableOrdersDrawer open={isNoSuitableOpen} onClose={() => setIsNoSuitableOpen(false)} />

      <SnackbarNotification
        state={{
          open: Boolean(error),
          vertical: 'top',
          horizontal: 'center',
          severity: 'error',
          message: error,
        }}
        fontSize={clampFontSize(globalFontSize, 14, 18)}
        onClose={() => setError('')}
      />
    </>
  );
}
