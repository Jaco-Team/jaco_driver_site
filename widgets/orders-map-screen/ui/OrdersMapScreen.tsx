import React, { memo, useCallback, useEffect, useRef } from 'react';
import { YMaps, Map, Placemark, TrafficControl, ZoomControl } from '@pbe/react-yandex-maps';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import LocationOffIcon from '@mui/icons-material/LocationOff';
import PinDropIcon from '@mui/icons-material/PinDrop';

import { useHeaderStore } from '@/features/header/model/header.store';
import { useOrdersStore } from '@/entities/order/model/order.store';
import type { HomeLocation, Order } from '@/entities/order/model/order.types';
import { roboto } from '@/shared/ui/Font';
import { log } from '@/shared/api/client';
import { OrdersFilterSheet } from '@/widgets/order/ui/components/OrdersFilterSheet';
import { OrderConfirmModal } from '@/widgets/order/ui/components/OrderConfirmModal';
import { ErrorModal } from '@/shared/ui/ErrorModal/ErrorModal';

declare const ymaps: {
  templateLayoutFactory: {
    createClass: (template: string) => unknown;
  };
};

type MapInstance = {
  setCenter: (center: [number, number]) => void;
};

interface MapPointProps {
  item: Order;
  theme: string;
  mapScale: string;
  globalFontSize: number;
  showOrdersMap: (id: number | string) => void;
}

const OrdersMapPoints = memo(function OrdersMapPoints({
  theme,
  globalFontSize,
  mapScale,
}: {
  theme: string;
  globalFontSize: number;
  mapScale: string;
}) {
  const { getOrders, orders, update_interval, showOrdersMap } = useOrdersStore((state) => ({
    getOrders: state.getOrders,
    orders: state.orders,
    update_interval: state.update_interval,
    showOrdersMap: state.showOrdersMap,
  }));

  useEffect(() => {
    const interval = window.setInterval(
      () => {
        getOrders();
      },
      parseInt(`${update_interval}`, 10) * 1000
    );

    return () => window.clearInterval(interval);
  }, [getOrders, update_interval]);

  return (
    <>
      {orders.map((item) => (
        <OrdersMapPoint
          key={item.id}
          item={item}
          theme={theme}
          mapScale={mapScale}
          globalFontSize={globalFontSize}
          showOrdersMap={showOrdersMap}
        />
      ))}
    </>
  );
});

const OrdersMapPoint = memo(function OrdersMapPoint({
  item,
  theme,
  mapScale,
  globalFontSize,
  showOrdersMap,
}: MapPointProps) {
  const scale = String(mapScale).replace('.', '_');
  const markerColor = (item?.point_color || item?.color) ?? 'blue';
  const label = item?.point_text ?? '';

  const circleLayout = ymaps.templateLayoutFactory.createClass(
    `<div class="map-img ${roboto.variable}"><span class='span_svg_circle_${scale}'><svg xmlns="http://www.w3.org/2000/svg" width="80" height="80" fill="none" viewBox="0 0 24 24"><path fill="${markerColor}" d="M11.969 2c-5.52 0-10 4.48-10 10s4.48 10 10 10 10-4.48 10-10-4.47-10-10-10m.03 14.23c-2.34 0-4.23-1.89-4.23-4.23s1.89-4.23 4.23-4.23 4.23 1.89 4.23 4.23-1.89 4.23-4.23 4.23" /></svg></span><span class='span_text_${theme}' style='font-size: ${globalFontSize}px'>${label}</span></div>`
  );

  const locationLayout = ymaps.templateLayoutFactory.createClass(
    `<div class="map-img ${roboto.variable}"><span class='span_svg_loc_${scale}'><svg xmlns="http://www.w3.org/2000/svg" xmlSpace="preserve" id="Layer_1" width="80" height="80" version="1" viewBox="0 0 64 64"><path fill="${markerColor}" d="M32 0C18.746 0 8 10.746 8 24c0 5.219 1.711 10.008 4.555 13.93.051.094.059.199.117.289l16 24a4 4 0 0 0 6.656 0l16-24c.059-.09.066-.195.117-.289C54.289 34.008 56 29.219 56 24 56 10.746 45.254 0 32 0m0 32a8 8 0 1 1 0-16 8 8 0 0 1 0 16" /></svg></span><span class='span_text_${theme}' style='font-size: ${globalFontSize}px'>${label}</span></div>`
  );

  const activeWidth = typeof label === 'string' ? label.length * (globalFontSize / 1.8) : 48;
  const geometry =
    typeof item?.xy?.latitude === 'number' && typeof item?.xy?.longitude === 'number'
      ? ([item.xy.latitude, item.xy.longitude] as any)
      : undefined;

  if (!geometry) {
    return null;
  }

  if (theme !== 'classic') {
    return (
      <Placemark
        geometry={geometry}
        instanceRef={(ref: any) => {
          ref?.events.add('click', () => showOrdersMap(item.id));
        }}
        options={{
          iconLayout: !item.close_time_ ? circleLayout : locationLayout,
          iconShape: {
            type: 'Rectangle',
            coordinates: [
              [-10, -15],
              [activeWidth, 10],
            ],
          },
        }}
      />
    );
  }

  return (
    <Placemark
      geometry={geometry}
      properties={{ iconCaption: label }}
      instanceRef={(ref: any) => {
        ref?.events.add('click', () => showOrdersMap(item.id));
      }}
      options={{
        preset:
          parseInt(`${item?.status_order}`, 10) === 6
            ? 'islands#blueDotIcon'
            : 'islands#circleDotIcon',
        iconColor: markerColor,
        iconShape: { type: 'Rectangle' },
      }}
    />
  );
});

const OrdersMapHomePoint = memo(function OrdersMapHomePoint({
  point,
  getHome,
}: {
  point: [number, number];
  getHome: () => void;
}) {
  const nightMap = useHeaderStore((state) => state.night_map);
  const fill = nightMap ? '#f0f8ff' : '#000';
  const homeLayout = ymaps.templateLayoutFactory.createClass(
    `<span class="map-img ${roboto.variable}"><span class="span_svg_home"><svg xmlns="http://www.w3.org/2000/svg" width="30" height="30" fill="none" viewBox="0 0 24 24"><path fill="${fill}" stroke="${fill}" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6.5 20v-9H3l9-6 9 6h-3.5v9h-3v-3.5A1.5 1.5 0 0 0 13 15h-2a1.5 1.5 0 0 0-1.5 1.5V20z" /></svg></span></span>`
  );

  return (
    <Placemark
      geometry={point}
      onClick={getHome}
      options={{
        iconLayout: homeLayout,
        iconShape: {
          type: 'Rectangle',
          coordinates: [
            [-10, -10],
            [10, 10],
          ],
        },
      }}
    />
  );
});

const OrdersMapDriverPoint = memo(function OrdersMapDriverPoint({
  theme,
  mapScale,
  location_driver,
  globalFontSize,
  location_driver_time_text,
}: {
  theme: string;
  mapScale: string;
  location_driver: [number, number];
  globalFontSize: number;
  location_driver_time_text: string;
}) {
  const scale = String(mapScale).replace('.', '_');
  const trackLayout = ymaps.templateLayoutFactory.createClass(
    `<span class="map-img ${roboto.variable}"><span class='span_svg_circle_${scale}'><svg xmlns="http://www.w3.org/2000/svg" xmlSpace="preserve" id="Capa_1" width="80" height="80" fill="red" version="1.1" viewBox="0 0 462.522 462.522"><path d="M432.958 222.262c-1.452-.305-2.823-.592-4.042-.909-13.821-3.594-20.129-5.564-24.793-14.569l-17.667-35.768c-5.678-10.961-20.339-19.879-32.682-19.879h-31.453v-41.303c0-7.416-6.034-13.45-13.452-13.45l-219.07.22c-7.218 0-12.661 5.736-12.661 13.343v12.208h-56.12C9.429 122.156 0 131.584 0 143.174s9.429 21.018 21.018 21.018h56.119v20.145H40.394c-11.589 0-21.018 9.429-21.018 21.018s9.429 21.018 21.018 21.018h36.743v20.145H59.77c-11.589 0-21.018 9.429-21.018 21.018s9.429 21.018 21.018 21.018h17.367v21.07c0 7.416 6.034 13.45 13.45 13.45h22.788c3.549 24.323 24.542 43.064 49.837 43.064 25.297 0 46.291-18.741 49.841-43.064h92.224c.479 0 .97-.032 1.46-.064 3.522 24.354 24.528 43.128 49.845 43.128 25.297 0 46.291-18.741 49.841-43.064h32.732c12.885 0 23.368-10.482 23.368-23.366V260.06c-.001-31.595-17.793-35.328-29.565-37.798" /></svg></span><span class='span_text_${theme}' style='font-size: ${globalFontSize}px'>${location_driver_time_text}</span></span>`
  );

  return (
    <Placemark
      geometry={location_driver}
      options={{
        iconLayout: trackLayout,
        iconShape: {
          type: 'Rectangle',
          coordinates: [
            [-10, -10],
            [10, 10],
          ],
        },
      }}
    />
  );
});

export function OrdersMapScreen() {
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
  }));

  const getHome = useCallback(() => {
    if (!orders.home?.center) return;

    log('map_home_center', 'Центрирование карты на домашнюю точку');
    mapRef.current?.setCenter(orders.home.center);
  }, [orders.home]);

  const handleConfirm = useCallback(() => {
    if (!orders.order_finish_id) return;

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

  return (
    <>
      <OrdersFilterSheet />

      <div className="location_svg">
        <Button onClick={orders.set_type_location} aria-label="Показать мою геопозицию">
          {orders.type_location === 'location' ? (
            <LocationOnIcon style={{ color: iconColor }} />
          ) : orders.type_location === 'watch' ? (
            <PinDropIcon style={{ color: iconColor }} />
          ) : (
            <LocationOffIcon style={{ color: iconColor }} />
          )}
        </Button>
      </div>

      {orders.home ? (
        <div
          style={
            header.night_map
              ? { filter: 'invert(90%) hue-rotate(180deg) brightness(85%)', height: '100vh' }
              : undefined
          }
        >
          <YMaps query={{ lang: 'ru_RU', apikey: 'f600fbbd-6500-4bf7-a0ab-ec9336f6c7d8' }}>
            <Map
              defaultState={orders.home as HomeLocation}
              instanceRef={(ref: MapInstance | null) => {
                mapRef.current = ref;
              }}
              width="100%"
              height="100vh"
              style={{ minHeight: '100vh' }}
              modules={['control.ZoomControl', 'control.TrafficControl']}
            >
              <TrafficControl options={{ size: 'small', position: { top: 150, right: 20 } }} />
              {header.is_scaleMap ? (
                <ZoomControl options={{ size: 'large', position: { top: 200, right: 20 } }} />
              ) : null}

              <OrdersMapHomePoint point={orders.home.center} getHome={getHome} />

              {orders.location_driver && orders.type_location !== 'none' ? (
                <OrdersMapDriverPoint
                  theme={header.theme}
                  mapScale={header.mapScale}
                  location_driver={orders.location_driver}
                  globalFontSize={header.globalFontSize}
                  location_driver_time_text={orders.location_driver_time_text}
                />
              ) : null}

              <OrdersMapPoints
                theme={header.theme}
                mapScale={header.mapScale}
                globalFontSize={header.globalFontSize}
              />
            </Map>
          </YMaps>
        </div>
      ) : null}

      <div
        style={{
          position: 'absolute',
          zIndex: 10,
          display: 'flex',
          flexDirection: 'row',
          justifyContent: 'space-between',
          width: '90%',
          left: '5%',
          bottom: 50,
          backgroundColor: '#000',
          opacity: 0.7,
          borderRadius: 60,
        }}
      >
        <Button
          className="noselect"
          style={{ flex: 3, color: orders.type.id === 1 ? 'green' : '#fff', fontWeight: 'bold' }}
          onClick={() => orders.setType({ id: 1, text: 'Активные' }, -1)}
        >
          Активные
        </Button>
        <Button
          className="noselect"
          style={{ flex: 1, color: orders.type.id === 2 ? 'green' : '#fff', fontWeight: 'bold' }}
          onClick={() => orders.setType({ id: 2, text: 'Мои отмеченные' }, -1)}
        >
          Мои
        </Button>
        <Button
          className="noselect"
          style={{ flex: 3, color: orders.type.id === 5 ? 'green' : '#fff', fontWeight: 'bold' }}
          onClick={() => orders.setType({ id: 5, text: 'У других курьеров' }, -1)}
        >
          У других
        </Button>
      </div>

      <div
        style={{
          position: 'absolute',
          zIndex: 10,
          display: 'flex',
          flexDirection: 'row',
          justifyContent: 'space-around',
          width: '90%',
          left: '5%',
          bottom: 90,
        }}
      >
        <Typography
          style={{ fontSize: header.globalFontSize, fontWeight: 'bold', color: iconColor }}
          component="span"
        >
          {orders.limit}
        </Typography>
        {orders.limit_count?.length > 0 ? (
          <Typography
            style={{ fontSize: header.globalFontSize, fontWeight: 'bold', color: iconColor }}
            component="span"
          >
            {orders.limit_count}
          </Typography>
        ) : null}
      </div>

      <OrderConfirmModal
        open={orders.modalConfirm}
        orderId={orders.order_finish_id}
        typeConfirm={orders.type_confirm}
        onClose={() => orders.setActiveConfirm(false, null, true, null, null)}
        onConfirm={handleConfirm}
      />

      <ErrorModal
        open={orders.showErrOrder}
        errorText={orders.textErrOrder}
        onClose={orders.closeErrOrder}
      />
    </>
  );
}
