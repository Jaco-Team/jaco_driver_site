export interface OfflineMapCity {
  id: string;
  name: string;
  bounds: { west: number; south: number; east: number; north: number };
}

// Working rectangles include the urban area and a margin, not cadastral borders.
export const OFFLINE_MAP_CITIES: readonly OfflineMapCity[] = [
  {
    id: 'samara',
    name: 'Самара',
    bounds: { west: 49.75, south: 53.0, east: 50.65, north: 53.48 },
  },
  {
    id: 'tolyatti',
    name: 'Тольятти',
    bounds: { west: 49.05, south: 53.38, east: 49.72, north: 53.74 },
  },
];

export const OFFLINE_CITY_MIN_ZOOM = 10;
export const OFFLINE_CITY_MAX_ZOOM = 15;
export const OFFLINE_CITY_MAX_TILES = 10000;

export function getOfflineMapCity(id: unknown): OfflineMapCity | undefined {
  return OFFLINE_MAP_CITIES.find((city) => city.id === id);
}

export function findOfflineMapCity(
  latitude: number,
  longitude: number
): OfflineMapCity | undefined {
  return OFFLINE_MAP_CITIES.find(
    ({ bounds }) =>
      latitude >= bounds.south &&
      latitude <= bounds.north &&
      longitude >= bounds.west &&
      longitude <= bounds.east
  );
}
