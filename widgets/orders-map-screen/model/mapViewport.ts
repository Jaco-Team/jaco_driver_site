import type { OrderMapGroup } from '@/entities/order/model/orderMapGroups';

export type MapBounds = [[number, number], [number, number]];

export interface MapViewport {
  bounds: MapBounds;
  center: [number, number];
}

export interface MapEdgeIndicator {
  sector: number;
  angle: number;
  left: number;
  top: number;
  orderCount: number;
  statusColors: string[];
  target: OrderMapGroup;
}

function isInsideBounds(coordinate: [number, number], bounds: MapBounds): boolean {
  const minLatitude = Math.min(bounds[0][0], bounds[1][0]);
  const maxLatitude = Math.max(bounds[0][0], bounds[1][0]);
  const minLongitude = Math.min(bounds[0][1], bounds[1][1]);
  const maxLongitude = Math.max(bounds[0][1], bounds[1][1]);

  return (
    coordinate[0] >= minLatitude &&
    coordinate[0] <= maxLatitude &&
    coordinate[1] >= minLongitude &&
    coordinate[1] <= maxLongitude
  );
}

function getDirection(group: OrderMapGroup, center: [number, number]) {
  const latitudeDelta = group.coordinate[0] - center[0];
  const longitudeDelta = group.coordinate[1] - center[1];
  const angle = (Math.atan2(longitudeDelta, latitudeDelta) * 180) / Math.PI;
  const normalizedAngle = (angle + 360) % 360;
  const sector = Math.round(normalizedAngle / 45) % 8;
  const sectorAngle = sector * 45;
  const radians = (sectorAngle * Math.PI) / 180;

  return {
    sector,
    angle: sectorAngle,
    left: 50 + Math.sin(radians) * 43,
    top: 50 - Math.cos(radians) * 43,
  };
}

export function getMapEdgeIndicators(
  groups: OrderMapGroup[],
  viewport: MapViewport | null
): MapEdgeIndicator[] {
  if (!viewport) {
    return [];
  }

  const indicators = new Map<number, MapEdgeIndicator>();

  for (const group of groups) {
    if (isInsideBounds(group.coordinate, viewport.bounds)) {
      continue;
    }

    const direction = getDirection(group, viewport.center);
    const existing = indicators.get(direction.sector);

    if (existing) {
      existing.orderCount += group.count;

      existing.statusColors.push(...group.statusColors);

      continue;
    }

    indicators.set(direction.sector, {
      ...direction,
      orderCount: group.count,
      statusColors: [...group.statusColors],
      target: group,
    });
  }

  return Array.from(indicators.values()).sort((left, right) => left.sector - right.sector);
}
