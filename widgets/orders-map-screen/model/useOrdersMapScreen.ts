import { useCallback, useEffect, useRef } from 'react';

import { useHeaderStore } from '@/features/header/model/header.store';
import { useOrdersStore } from '@/entities/order/model/order.store';
import { log } from '@/components/analytics';
import type { MapInstance, UseOrdersMapScreenResult } from './useOrdersMapScreen.type';

export function useOrdersMapScreen(): UseOrdersMapScreenResult {
  const mapRef = useRef<MapInstance | null>(null);
  const header = useHeaderStore((state) => ({
    globalFontSize: state.globalFontSize,
    theme: state.theme,
    mapScale: state.mapScale,
    night_map: state.night_map,
    is_scaleMap: state.is_scaleMap,
  }));
  const orders = useOrdersStore((state) => ({
    type: state.type,
    limit: state.limit,
    limit_count: state.limit_count,
    setType: state.setType,
    home: state.home,
    location_driver: state.location_driver,
    type_location: state.type_location,
    set_type_location: state.set_type_location,
    location_driver_time_text: state.location_driver_time_text,
    modalConfirm: state.modalConfirm,
    order_finish_id: state.order_finish_id,
    type_confirm: state.type_confirm,
    showErrOrder: state.showErrOrder,
    textErrOrder: state.textErrOrder,
    closeErrOrder: state.closeErrOrder,
    setActiveConfirm: state.setActiveConfirm,
    actionFinishOrder: state.actionFinishOrder,
    actionCencelOrder: state.actionCencelOrder,
    actionGetOrder: state.actionGetOrder,
    actionFakeOrder: state.actionFakeOrder,
    isClick: state.isClick,
    is_load: state.is_load,
  }));

  const getHome = useCallback(() => {
    if (!orders.home?.center) return;

    log('map_home_center', 'Центрирование карты на домашнюю точку');
    mapRef.current?.setCenter(orders.home.center);
  }, [orders.home]);

  const handleConfirm = useCallback(() => {
    if (!orders.order_finish_id || orders.isClick || orders.is_load) return;

    switch (orders.type_confirm) {
      case 'finish':
        orders.actionFinishOrder(orders.order_finish_id, true);
        break;
      case 'cancel':
        orders.actionCencelOrder(orders.order_finish_id, true);
        break;
      case 'take':
        orders.actionGetOrder(orders.order_finish_id, true);
        break;
      case 'fake':
        orders.actionFakeOrder(orders.order_finish_id, true);
        break;
      default:
        break;
    }
  }, [orders]);

  useEffect(() => {
    if (mapRef.current && orders.home?.center) {
      mapRef.current.setCenter(orders.home.center);
    }
  }, [orders.home]);

  const iconColor = header.night_map ? '#f0f8ff' : '#000';

  return {
    mapRef,
    header,
    orders,
    iconColor,
    getHome,
    handleConfirm,
  };
}
