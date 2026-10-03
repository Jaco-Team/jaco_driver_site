import { memo, useMemo } from 'react';

import type { OrderMapGroup } from '@/entities/order/model/orderMapGroups';
import { sanitizeCssColor } from '@/shared/lib/escapeHtml';
import { getMapEdgeIndicators, type MapViewport } from '../model/mapViewport';

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

export const OrdersMapCompass = memo(function OrdersMapCompass({
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
