import React, { memo, useEffect, useMemo } from 'react';
import {
  YMaps,
  Map,
  Placemark,
  TrafficControl,
  ZoomControl,
  useYMaps,
} from '@pbe/react-yandex-maps';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import LocationOffIcon from '@mui/icons-material/LocationOff';
import PinDropIcon from '@mui/icons-material/PinDrop';

import { useHeaderStore } from '@/features/header/model/header.store';
import { useOrdersStore } from '@/entities/order/model/order.store';
import type { HomeLocation } from '@/entities/order/model/order.types';
import {
  groupOrdersByMapLocation,
  type OrderMapGroup,
} from '@/entities/order/model/orderMapGroups';
import { escapeHtml, sanitizeCssColor, sanitizeCssIdent } from '@/shared/lib/escapeHtml';
import { roboto } from '@/shared/ui/Font';
import { OrdersFilterSheet } from '@/widgets/order/ui/components/OrdersFilterSheet';
import { OrderConfirmModal } from '@/widgets/order/ui/components/OrderConfirmModal';
import { ErrorModal } from '@/shared/ui/ErrorModal/ErrorModal';
import { useOrdersMapScreen } from '../model/useOrdersMapScreen';
import { getMapEdgeIndicators, type MapViewport } from '../model/mapViewport';

const YANDEX_MAPS_API_KEY = process.env.NEXT_PUBLIC_YANDEX_MAPS_API_KEY ?? '';

type YMapsTemplateApi = {
  templateLayoutFactory: {
    createClass: (template: string, overrides?: Record<string, unknown>) => unknown;
  };
};

type IconLayoutInstance = {
  _shapeFrame?: number;
  _onMarkerClick?: (event: Event) => void;
  getElement?: () => Element | null;
  getData?: () => {
    options?: { set?: (key: string, value: unknown) => void };
    geoObject?: { events?: { fire?: (type: string) => void } };
  };
};

type IconLayoutClass = {
  superclass?: {
    build?: (this: unknown) => void;
    clear?: (this: unknown) => void;
  };
};

function resolveMarkerElement(root: Element | null): HTMLElement | null {
  if (!root) {
    return null;
  }

  if (root instanceof HTMLElement && root.classList.contains('map-img')) {
    return root;
  }

  return root.querySelector('.map-img');
}

function applyMarkerIconShape(layout: IconLayoutInstance) {
  const root = layout.getElement?.() ?? null;
  const marker = resolveMarkerElement(root);

  if (!marker) {
    return;
  }

  const style = window.getComputedStyle(marker);
  const left = Number.parseFloat(style.left) || marker.offsetLeft || 0;
  const top = Number.parseFloat(style.top) || marker.offsetTop || 0;
  const width = Math.ceil(
    Math.max(marker.offsetWidth, marker.scrollWidth, marker.getBoundingClientRect().width)
  );
  const height = Math.ceil(
    Math.max(marker.offsetHeight, marker.scrollHeight, marker.getBoundingClientRect().height)
  );
  const shape = {
    type: 'Rectangle',
    coordinates: [
      [left, top],
      [left + (width || 240), top + (height || 36)],
    ],
  };

  const options = layout.getData?.()?.options;

  options?.set?.('shape', shape);
  options?.set?.('iconShape', shape);
}

function createMeasuredIconLayout(yMapsApi: YMapsTemplateApi, template: string) {
  const Layout = yMapsApi.templateLayoutFactory.createClass(template, {
    build(this: IconLayoutInstance) {
      (Layout as IconLayoutClass).superclass?.build?.call(this);
      applyMarkerIconShape(this);

      if (this._shapeFrame) {
        window.cancelAnimationFrame(this._shapeFrame);
      }

      this._shapeFrame = window.requestAnimationFrame(() => applyMarkerIconShape(this));

      const marker = resolveMarkerElement(this.getElement?.() ?? null);

      if (!marker) {
        return;
      }

      this._onMarkerClick = () => {
        this.getData?.()?.geoObject?.events?.fire?.('click');
      };
      marker.addEventListener('click', this._onMarkerClick);
    },
    clear(this: IconLayoutInstance) {
      if (this._shapeFrame) {
        window.cancelAnimationFrame(this._shapeFrame);
        this._shapeFrame = undefined;
      }

      const marker = resolveMarkerElement(this.getElement?.() ?? null);

      if (marker && this._onMarkerClick) {
        marker.removeEventListener('click', this._onMarkerClick);
        this._onMarkerClick = undefined;
      }

      (Layout as IconLayoutClass).superclass?.clear?.call(this);
    },
  });

  return Layout;
}

interface MapPointProps {
  group: OrderMapGroup;
  theme: string;
  mapScale: string;
  globalFontSize: number;
  showOrdersMap: (id: number | string) => void;
  yMapsApi: YMapsTemplateApi;
}

const OrdersMapPoints = memo(function OrdersMapPoints({
  groups,
  theme,
  globalFontSize,
  mapScale,
  yMapsApi,
}: {
  groups: OrderMapGroup[];
  theme: string;
  globalFontSize: number;
  mapScale: string;
  yMapsApi: YMapsTemplateApi;
}) {
  const { getOrders, update_interval, showOrdersMap } = useOrdersStore((state) => ({
    getOrders: state.getOrders,
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
      {groups.map((group) => (
        <OrdersMapPoint
          key={group.key}
          group={group}
          theme={theme}
          mapScale={mapScale}
          globalFontSize={globalFontSize}
          showOrdersMap={showOrdersMap}
          yMapsApi={yMapsApi}
        />
      ))}
    </>
  );
});

const OrdersMapPoint = memo(function OrdersMapPoint({
  group,
  theme,
  mapScale,
  globalFontSize,
  showOrdersMap,
  yMapsApi,
}: MapPointProps) {
  const item = group.representative;
  const scale = sanitizeCssIdent(String(mapScale).replace('.', '_'), '1');
  const markerColor = sanitizeCssColor((item?.point_color || item?.color) ?? 'blue');
  const rawLabel = String(item?.point_text ?? '');
  const label = escapeHtml(rawLabel);
  const themeClass = sanitizeCssIdent(theme === 'classic' ? 'white' : theme, 'white');
  const fontClass = sanitizeCssIdent(roboto.variable, 'font');
  const fontSize = Number.isFinite(globalFontSize) ? globalFontSize : 16;
  const compactFontSize = Math.min(18, Math.max(12, fontSize - 2));
  const groupCount =
    group.count > 1
      ? `<span class="map-marker-count" style="font-size:${compactFontSize}px">${group.count}</span>`
      : '';
  const statusDots =
    group.count > 1
      ? `<span class="map-marker-statuses">${group.statusColors
          .slice(0, 3)
          .map(
            (color) =>
              `<span class="map-marker-status" style="background:${sanitizeCssColor(color)}"></span>`
          )
          .join('')}${
          group.statusColors.length > 3
            ? `<span class="map-marker-status-overflow">+${group.statusColors.length - 3}</span>`
            : ''
        }</span>`
      : '';

  const circleLayout = useMemo(
    () =>
      createMeasuredIconLayout(
        yMapsApi,
        `<div class="map-img ${fontClass} map-img--group-${group.count > 1 ? 'multiple' : 'single'}"><span class="map-marker-icon"><span class='span_svg_circle_${scale}'><svg xmlns="http://www.w3.org/2000/svg" width="80" height="80" fill="none" viewBox="0 0 24 24"><path fill="${markerColor}" d="M11.969 2c-5.52 0-10 4.48-10 10s4.48 10 10 10 10-4.48 10-10-4.47-10-10-10m.03 14.23c-2.34 0-4.23-1.89-4.23-4.23s1.89-4.23 4.23-4.23 4.23 1.89 4.23 4.23-1.89 4.23-4.23 4.23" /></svg></span>${groupCount}${statusDots}</span><span class='span_text_${themeClass}' style='font-size: ${fontSize}px'>${label}</span></div>`
      ),
    [
      fontClass,
      fontSize,
      group.count,
      groupCount,
      label,
      markerColor,
      scale,
      statusDots,
      themeClass,
      yMapsApi,
    ]
  );

  const locationLayout = useMemo(
    () =>
      createMeasuredIconLayout(
        yMapsApi,
        `<div class="map-img ${fontClass} map-img--group-${group.count > 1 ? 'multiple' : 'single'}"><span class="map-marker-icon"><span class='span_svg_loc_${scale}'><svg xmlns="http://www.w3.org/2000/svg" xmlSpace="preserve" id="Layer_1" width="80" height="80" version="1" viewBox="0 0 64 64"><path fill="${markerColor}" d="M32 0C18.746 0 8 10.746 8 24c0 5.219 1.711 10.008 4.555 13.93.051.094.059.199.117.289l16 24a4 4 0 0 0 6.656 0l16-24c.059-.09.066-.195.117-.289C54.289 34.008 56 29.219 56 24 56 10.746 45.254 0 32 0m0 32a8 8 0 1 1 0-16 8 8 0 0 1 0 16" /></svg></span>${groupCount}${statusDots}</span><span class='span_text_${themeClass}' style='font-size: ${fontSize}px'>${label}</span></div>`
      ),
    [
      fontClass,
      fontSize,
      group.count,
      groupCount,
      label,
      markerColor,
      scale,
      statusDots,
      themeClass,
      yMapsApi,
    ]
  );

  const lat = Number(item?.xy?.latitude);
  const lon = Number(item?.xy?.longitude);
  const geometry =
    Number.isFinite(lat) && Number.isFinite(lon) ? ([lat, lon] as [number, number]) : undefined;

  if (!geometry) {
    return null;
  }

  if (theme !== 'classic' || group.count > 1) {
    return (
      <Placemark
        geometry={geometry}
        onClick={() => showOrdersMap(item.id)}
        instanceRef={(ref: any) => {
          ref?.events.add('click', () => showOrdersMap(item.id));
        }}
        options={
          {
            iconLayout: !item.close_time_ ? circleLayout : locationLayout,
          } as any
        }
      />
    );
  }

  return (
    <Placemark
      geometry={geometry}
      onClick={() => showOrdersMap(item.id)}
      properties={{ iconCaption: rawLabel }}
      instanceRef={(ref: any) => {
        ref?.events.add('click', () => showOrdersMap(item.id));
      }}
      options={{
        preset:
          parseInt(`${item?.status_order}`, 10) === 6
            ? 'islands#blueDotIcon'
            : 'islands#circleDotIcon',
        iconColor: markerColor,
      }}
    />
  );
});

const OrdersMapHomePoint = memo(function OrdersMapHomePoint({
  point,
  getHome,
  yMapsApi,
}: {
  point: [number, number];
  getHome: () => void;
  yMapsApi: YMapsTemplateApi;
}) {
  const nightMap = useHeaderStore((state) => state.night_map);
  const fill = sanitizeCssColor(nightMap ? '#f0f8ff' : '#000', '#000');
  const fontClass = sanitizeCssIdent(roboto.variable, 'font');
  const homeLayout = useMemo(
    () =>
      createMeasuredIconLayout(
        yMapsApi,
        `<span class="map-img ${fontClass}"><span class="span_svg_home"><svg xmlns="http://www.w3.org/2000/svg" width="30" height="30" fill="none" viewBox="0 0 24 24"><path fill="${fill}" stroke="${fill}" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6.5 20v-9H3l9-6 9 6h-3.5v9h-3v-3.5A1.5 1.5 0 0 0 13 15h-2a1.5 1.5 0 0 0-1.5 1.5V20z" /></svg></span></span>`
      ),
    [fill, fontClass, yMapsApi]
  );

  return (
    <Placemark
      geometry={point}
      onClick={getHome}
      options={
        {
          iconLayout: homeLayout,
        } as any
      }
    />
  );
});

const OrdersMapDriverPoint = memo(function OrdersMapDriverPoint({
  theme,
  mapScale,
  location_driver,
  globalFontSize,
  location_driver_time_text,
  yMapsApi,
}: {
  theme: string;
  mapScale: string;
  location_driver: [number, number];
  globalFontSize: number;
  location_driver_time_text: string;
  yMapsApi: YMapsTemplateApi;
}) {
  const scale = sanitizeCssIdent(String(mapScale).replace('.', '_'), '1');
  const themeClass = sanitizeCssIdent(theme, 'white');
  const fontClass = sanitizeCssIdent(roboto.variable, 'font');
  const fontSize = Number.isFinite(globalFontSize) ? globalFontSize : 16;
  const timeText = escapeHtml(location_driver_time_text);
  const trackLayout = useMemo(
    () =>
      createMeasuredIconLayout(
        yMapsApi,
        `<span class="map-img ${fontClass}"><span class='span_svg_circle_${scale}'><svg xmlns="http://www.w3.org/2000/svg" xmlSpace="preserve" id="Capa_1" width="80" height="80" fill="red" version="1.1" viewBox="0 0 462.522 462.522"><path d="M432.958 222.262c-1.452-.305-2.823-.592-4.042-.909-13.821-3.594-20.129-5.564-24.793-14.569l-17.667-35.768c-5.678-10.961-20.339-19.879-32.682-19.879h-31.453v-41.303c0-7.416-6.034-13.45-13.452-13.45l-219.07.22c-7.218 0-12.661 5.736-12.661 13.343v12.208h-56.12C9.429 122.156 0 131.584 0 143.174s9.429 21.018 21.018 21.018h56.119v20.145H40.394c-11.589 0-21.018 9.429-21.018 21.018s9.429 21.018 21.018 21.018h36.743v20.145H59.77c-11.589 0-21.018 9.429-21.018 21.018s9.429 21.018 21.018 21.018h17.367v21.07c0 7.416 6.034 13.45 13.45 13.45h22.788c3.549 24.323 24.542 43.064 49.837 43.064 25.297 0 46.291-18.741 49.841-43.064h92.224c.479 0 .97-.032 1.46-.064 3.522 24.354 24.528 43.128 49.845 43.128 25.297 0 46.291-18.741 49.841-43.064h32.732c12.885 0 23.368-10.482 23.368-23.366V260.06c-.001-31.595-17.793-35.328-29.565-37.798" /></svg></span><span class='span_text_${themeClass}' style='font-size: ${fontSize}px'>${timeText}</span></span>`
      ),
    [fontClass, fontSize, scale, themeClass, timeText, yMapsApi]
  );

  return (
    <Placemark
      geometry={location_driver}
      options={
        {
          iconLayout: trackLayout,
        } as any
      }
    />
  );
});

const OrdersMapObjects = memo(function OrdersMapObjects({
  header,
  orders,
  groups,
  getHome,
}: {
  header: ReturnType<typeof useOrdersMapScreen>['header'];
  orders: ReturnType<typeof useOrdersMapScreen>['orders'];
  groups: OrderMapGroup[];
  getHome: () => void;
}) {
  const yMapsApi = useYMaps(['templateLayoutFactory']) as YMapsTemplateApi | null;
  const home = orders.home;

  return (
    <>
      <TrafficControl options={{ size: 'small', position: { top: 150, right: 20 } } as any} />
      {header.is_scaleMap ? (
        <ZoomControl options={{ size: 'large', position: { top: 200, right: 20 } } as any} />
      ) : null}

      {yMapsApi && home ? (
        <>
          <OrdersMapHomePoint
            key={home.center.join(',')}
            point={home.center}
            getHome={getHome}
            yMapsApi={yMapsApi}
          />

          {orders.location_driver && orders.type_location !== 'none' ? (
            <OrdersMapDriverPoint
              theme={header.theme}
              mapScale={header.mapScale}
              location_driver={orders.location_driver}
              globalFontSize={header.globalFontSize}
              location_driver_time_text={orders.location_driver_time_text}
              yMapsApi={yMapsApi}
            />
          ) : null}

          <OrdersMapPoints
            groups={groups}
            theme={header.theme}
            mapScale={header.mapScale}
            globalFontSize={header.globalFontSize}
            yMapsApi={yMapsApi}
          />
        </>
      ) : null}
    </>
  );
});

const COMPASS_DIRECTIONS = [
  'север',
  'северо-восток',
  'восток',
  'юго-восток',
  'юг',
  'юго-запад',
  'запад',
  'северо-запад',
];

function getOrderCountLabel(count: number): string {
  const lastTwoDigits = count % 100;
  const lastDigit = count % 10;

  if (lastTwoDigits >= 11 && lastTwoDigits <= 14) {
    return `${count} заказов`;
  }

  if (lastDigit === 1) {
    return `${count} заказ`;
  }

  if (lastDigit >= 2 && lastDigit <= 4) {
    return `${count} заказа`;
  }

  return `${count} заказов`;
}

const OrdersMapCompass = memo(function OrdersMapCompass({
  groups,
  viewport,
  globalFontSize,
  onCenter,
}: {
  groups: OrderMapGroup[];
  viewport: MapViewport | null;
  globalFontSize: number;
  onCenter: (coordinate: [number, number]) => void;
}) {
  const indicators = useMemo(() => getMapEdgeIndicators(groups, viewport), [groups, viewport]);
  const countFontSize = Math.min(18, Math.max(12, globalFontSize - 2));

  if (indicators.length === 0) {
    return null;
  }

  return (
    <div className="orders-map-compass" aria-label="Заказы за пределами карты">
      {indicators.map((indicator) => (
        <button
          key={indicator.sector}
          type="button"
          className="orders-map-compass__indicator"
          style={{ left: `${indicator.left}%`, top: `${indicator.top}%` }}
          aria-label={`Показать ${getOrderCountLabel(indicator.orderCount)}, направление ${
            COMPASS_DIRECTIONS[indicator.sector]
          }`}
          onClick={() => onCenter(indicator.target.coordinate)}
        >
          <span
            className="orders-map-compass__arrow"
            style={{ transform: `rotate(${indicator.angle}deg)` }}
            aria-hidden="true"
          />
          <span className="orders-map-compass__count" style={{ fontSize: countFontSize }}>
            {indicator.orderCount}
          </span>
          <span className="orders-map-compass__statuses" aria-hidden="true">
            {indicator.statusColors.slice(0, 3).map((color) => (
              <span
                key={color}
                className="orders-map-compass__status"
                style={{ backgroundColor: sanitizeCssColor(color) }}
              />
            ))}
          </span>
        </button>
      ))}
    </div>
  );
});

export function OrdersMapScreen() {
  const {
    setMapInstance,
    viewport,
    header,
    orders,
    iconColor,
    getHome,
    centerOnCoordinate,
    handleConfirm,
  } = useOrdersMapScreen();
  const groups = useMemo(() => groupOrdersByMapLocation(orders.orders), [orders.orders]);

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
        <div className="orders-map-stage">
          <div
            className="orders-map-stage__map"
            style={
              header.night_map
                ? { filter: 'invert(90%) hue-rotate(180deg) brightness(85%)' }
                : undefined
            }
          >
            <YMaps
              query={{
                lang: 'ru_RU',
                ...(YANDEX_MAPS_API_KEY ? { apikey: YANDEX_MAPS_API_KEY } : {}),
              }}
            >
              <Map
                key={orders.home.center.join(',')}
                defaultState={orders.home as HomeLocation}
                instanceRef={setMapInstance}
                width="100%"
                height="100vh"
                style={{ minHeight: '100vh' }}
                modules={['control.ZoomControl', 'control.TrafficControl']}
              >
                <OrdersMapObjects
                  header={header}
                  orders={orders}
                  groups={groups}
                  getHome={getHome}
                />
              </Map>
            </YMaps>
          </div>

          <OrdersMapCompass
            groups={groups}
            viewport={viewport}
            globalFontSize={header.globalFontSize}
            onCenter={centerOnCoordinate}
          />
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
        busy={orders.isClick || orders.is_load}
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
