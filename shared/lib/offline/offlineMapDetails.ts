import { OFFLINE_MAP_CITIES } from '@/shared/config/offlineMapCities';

export const OFFLINE_DETAIL_MIN_ZOOM = 16;
export const OFFLINE_DETAIL_MAX_ZOOM = 19;
export const OFFLINE_DETAIL_MAX_TILES = 85;
export const OFFLINE_DETAIL_MAX_REGIONS = 128;
export const OFFLINE_DETAIL_MAX_BYTES = 128 * 1024 * 1024;
const MAX_VIEWED_CELLS = 32;
const GRID_SIZE = 2 ** OFFLINE_DETAIL_MIN_ZOOM;

interface Bounds {
  west: number;
  south: number;
  east: number;
  north: number;
}

export interface OfflineDetailTile {
  x: number;
  y: number;
  maxZoom: number;
}

function toTile(latitude: number, longitude: number) {
  return {
    x: Math.floor(((longitude + 180) / 360) * GRID_SIZE),
    y: Math.floor(
      ((1 - Math.asinh(Math.tan((latitude * Math.PI) / 180)) / Math.PI) / 2) * GRID_SIZE
    ),
  };
}

export function getOfflineDetailPlan(tile: OfflineDetailTile) {
  if (
    !tile ||
    ![tile.x, tile.y, tile.maxZoom].every(Number.isInteger) ||
    tile.x < 0 ||
    tile.x >= GRID_SIZE ||
    tile.y < 0 ||
    tile.y >= GRID_SIZE ||
    tile.maxZoom < OFFLINE_DETAIL_MIN_ZOOM ||
    tile.maxZoom > OFFLINE_DETAIL_MAX_ZOOM
  )
    return null;
  const longitude = (x: number) => (x / GRID_SIZE) * 360 - 180;
  const latitude = (y: number) =>
    (Math.atan(Math.sinh(Math.PI * (1 - (2 * y) / GRID_SIZE))) * 180) / Math.PI;
  const bounds = {
    west: longitude(tile.x) + 1e-10,
    east: longitude(tile.x + 1) - 1e-10,
    north: latitude(tile.y) - 1e-10,
    south: latitude(tile.y + 1) + 1e-10,
  };
  const city = OFFLINE_MAP_CITIES.find(
    ({ bounds: cityBounds }) =>
      bounds.west < cityBounds.east &&
      bounds.east > cityBounds.west &&
      bounds.south < cityBounds.north &&
      bounds.north > cityBounds.south
  );
  if (!city) return null;
  return {
    kind: 'detail' as const,
    parentCityId: city.id,
    detailTile: { ...tile },
    pointId: `detail:${OFFLINE_DETAIL_MIN_ZOOM}/${tile.x}/${tile.y}`,
    bounds,
    minZoom: OFFLINE_DETAIL_MIN_ZOOM,
    maxZoom: tile.maxZoom,
    initialZoom: OFFLINE_DETAIL_MIN_ZOOM - 1,
    cameraMinZoom: OFFLINE_DETAIL_MIN_ZOOM - 1,
    cameraMaxZoom: tile.maxZoom - 1,
  };
}

export type OfflineDetailPlan = NonNullable<ReturnType<typeof getOfflineDetailPlan>>;

export function getMarkerOfflineDetailPlans(coordinates: readonly (readonly number[])[]) {
  const plans = new Map<string, OfflineDetailPlan>();
  for (const coordinate of coordinates) {
    const [latitude, longitude] = coordinate;
    if (
      !Number.isFinite(latitude) ||
      !Number.isFinite(longitude) ||
      Math.abs(latitude) > 85 ||
      Math.abs(longitude) > 180
    )
      continue;
    const plan = getOfflineDetailPlan({
      ...toTile(latitude, longitude),
      maxZoom: OFFLINE_DETAIL_MAX_ZOOM,
    });
    if (plan) plans.set(plan.pointId, plan);
  }
  return [...plans.values()];
}

export function getViewedOfflineDetailPlans(bounds: Bounds, zoom: number) {
  if (
    !Number.isFinite(zoom) ||
    zoom < OFFLINE_DETAIL_MIN_ZOOM ||
    !Object.values(bounds).every(Number.isFinite) ||
    bounds.west >= bounds.east ||
    bounds.south >= bounds.north ||
    Math.abs(bounds.west) > 180 ||
    Math.abs(bounds.east) > 180 ||
    Math.abs(bounds.south) > 85 ||
    Math.abs(bounds.north) > 85
  )
    return [];
  const topLeft = toTile(bounds.north, bounds.west);
  const bottomRight = toTile(bounds.south, bounds.east);
  const center = toTile((bounds.north + bounds.south) / 2, (bounds.east + bounds.west) / 2);
  const plans: OfflineDetailPlan[] = [];
  // Bound planning work even if a map provider reports a malformed global viewport.
  for (let x = Math.max(topLeft.x, center.x - 8); x <= Math.min(bottomRight.x, center.x + 8); x++) {
    for (
      let y = Math.max(topLeft.y, center.y - 8);
      y <= Math.min(bottomRight.y, center.y + 8);
      y++
    ) {
      const plan = getOfflineDetailPlan({
        x,
        y,
        maxZoom: Math.min(OFFLINE_DETAIL_MAX_ZOOM, Math.floor(zoom)),
      });
      if (plan) plans.push(plan);
    }
  }
  return plans
    .sort(
      (a, b) =>
        Math.hypot(a.detailTile.x - center.x, a.detailTile.y - center.y) -
        Math.hypot(b.detailTile.x - center.x, b.detailTile.y - center.y)
    )
    .slice(0, MAX_VIEWED_CELLS);
}
