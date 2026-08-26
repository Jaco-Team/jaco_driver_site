import { useCallback, useEffect, useRef, useState } from 'react';

import { useHeaderStore } from '@/features/header/model/header.store';
import { useOrdersStore } from '@/entities/order/model/order.store';
import { log } from '@/components/analytics';
import type { MapInstance, UseOrdersMapScreenResult } from './useOrdersMapScreen.type';
import type { MapViewport } from './mapViewport';

export function useOrdersMapScreen(): UseOrdersMapScreenResult {
  const mapRef = useRef<MapInstance | null>(null);
  const [mapInstance, setMapInstanceState] = useState<MapInstance | null>(null);
  const [viewport, setViewport] = useState<MapViewport | null>(null);
  const header = useHeaderStore((state) => ({
    globalFontSize: state.globalFontSize,
    theme: state.theme,
    mapScale: state.mapScale,
    night_map: state.night_map,
    is_scaleMap: state.is_scaleMap,
  }));
  const orders = useOrdersStore((state) => ({
    type: state.type,
    orders: state.orders,
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
    showOrdersMap: state.showOrdersMap,
  }));

  const setMapInstance = useCallback((instance: MapInstance | null) => {
    mapRef.current = instance;
    setMapInstanceState(instance);
  }, []);

  const getHome = useCallback(() => {
    if (!orders.home?.center) return;

    log('map_home_center', 'Центрирование карты на домашнюю точку');
    mapRef.current?.setCenter(orders.home.center);
  }, [orders.home]);

  const centerOnCoordinate = useCallback((coordinate: [number, number]) => {
    log('map_edge_order_center', 'Переход к заказам за границей карты');
    mapRef.current?.setCenter(coordinate);
  }, []);

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

  useEffect(() => {
    if (!mapInstance) {
      setViewport(null);
      return undefined;
    }

    const updateViewport = () => {
      const bounds = mapInstance.getBounds?.();
      const center = mapInstance.getCenter?.();

      if (!bounds || !center) {
        return;
      }

      setViewport({ bounds, center });
    };

    updateViewport();
    mapInstance.events?.add?.('boundschange', updateViewport);

    return () => {
      mapInstance.events?.remove?.('boundschange', updateViewport);
    };
  }, [mapInstance]);

  const iconColor = header.night_map ? '#f0f8ff' : '#000';

  return {
    mapRef,
    setMapInstance,
    viewport,
    header,
    orders,
    iconColor,
    getHome,
    centerOnCoordinate,
    handleConfirm,
  };
}
