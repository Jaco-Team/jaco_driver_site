import { createHmac, timingSafeEqual } from 'node:crypto';
import {
  getOfflineDetailPlan,
  OFFLINE_DETAIL_MAX_TILES,
  OFFLINE_DETAIL_MAX_ZOOM,
  type OfflineDetailTile,
} from '@/shared/lib/offline/offlineMapDetails';
import {
  getOfflineMapCity,
  OFFLINE_CITY_MIN_ZOOM,
  OFFLINE_CITY_MAX_ZOOM,
  OFFLINE_CITY_MAX_TILES,
} from '@/shared/config/offlineMapCities';

const SESSION_TTL_MS = 20 * 60 * 1000;
const MIN_ALLOWED_ZOOM = 10;
const MAX_ALLOWED_ZOOM = 15;
const MAX_TILES = 1500;

export interface OfflineMapSessionBounds {
  west: number;
  south: number;
  east: number;
  north: number;
}

interface TileRange {
  z: number;
  minX: number;
  maxX: number;
  minY: number;
  maxY: number;
}

export interface TileSessionPayload {
  exp: number;
  purpose: 'offline-yandex-map';
  pointId: string;
  ranges: TileRange[];
}

function getTilesApiKey(): string {
  return `${process.env.YANDEX_TILES_API_KEY ?? ''}`.trim();
}

function encode(value: string): string {
  return Buffer.from(value).toString('base64url');
}

function sign(encodedPayload: string): string {
  return createHmac('sha256', getTilesApiKey()).update(encodedPayload).digest('base64url');
}

function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}

function coordinateToTile(longitude: number, latitude: number, zoom: number) {
  const scale = 2 ** zoom;
  const latitudeRadians = (latitude * Math.PI) / 180;

  return {
    x: clamp(Math.floor(((longitude + 180) / 360) * scale), 0, scale - 1),
    y: clamp(
      Math.floor(((1 - Math.asinh(Math.tan(latitudeRadians)) / Math.PI) / 2) * scale),
      0,
      scale - 1
    ),
  };
}

function buildRanges(
  bounds: OfflineMapSessionBounds,
  minZoom: number,
  maxZoom: number,
  maxTiles = MAX_TILES,
  allowedMaxZoom = MAX_ALLOWED_ZOOM
): TileRange[] | null {
  const values = [bounds.west, bounds.south, bounds.east, bounds.north];
  if (!values.every(Number.isFinite)) return null;
  if (
    bounds.west < -180 ||
    bounds.east > 180 ||
    bounds.south < -85.05112878 ||
    bounds.north > 85.05112878 ||
    bounds.west >= bounds.east ||
    bounds.south >= bounds.north
  ) {
    return null;
  }
  if (
    !Number.isInteger(minZoom) ||
    !Number.isInteger(maxZoom) ||
    minZoom < MIN_ALLOWED_ZOOM ||
    maxZoom > allowedMaxZoom ||
    minZoom > maxZoom
  ) {
    return null;
  }

  const ranges: TileRange[] = [];
  let tileCount = 0;

  for (let z = minZoom; z <= maxZoom; z += 1) {
    const topLeft = coordinateToTile(bounds.west, bounds.north, z);
    const bottomRight = coordinateToTile(bounds.east, bounds.south, z);
    const range = {
      z,
      minX: topLeft.x,
      maxX: bottomRight.x,
      minY: topLeft.y,
      maxY: bottomRight.y,
    };
    tileCount += (range.maxX - range.minX + 1) * (range.maxY - range.minY + 1);
    if (tileCount > maxTiles) return null;
    ranges.push(range);
  }

  return ranges;
}

export function hasYandexTilesApiKey(): boolean {
  return getTilesApiKey().length >= 20;
}

export function createOfflineMapSession(input: {
  pointId: unknown;
  bounds: OfflineMapSessionBounds;
  minZoom: number;
  maxZoom: number;
  cityId?: unknown;
  detailTile?: unknown;
}): string | null {
  const detail =
    input.detailTile === undefined
      ? null
      : getOfflineDetailPlan(input.detailTile as OfflineDetailTile);
  if (input.detailTile !== undefined && (!detail || input.cityId !== undefined)) return null;
  const city = input.cityId === undefined ? undefined : getOfflineMapCity(input.cityId);
  if (input.cityId !== undefined && !city) return null;
  const pointId = detail?.pointId ?? (city ? `city:${city.id}` : `${input.pointId ?? ''}`.trim());
  const ranges = detail
    ? buildRanges(
        detail.bounds,
        detail.minZoom,
        detail.maxZoom,
        OFFLINE_DETAIL_MAX_TILES,
        OFFLINE_DETAIL_MAX_ZOOM
      )
    : city
      ? buildRanges(
          city.bounds,
          OFFLINE_CITY_MIN_ZOOM,
          OFFLINE_CITY_MAX_ZOOM,
          OFFLINE_CITY_MAX_TILES
        )
      : buildRanges(input.bounds, input.minZoom, input.maxZoom);
  if (!pointId || pointId.length > 128 || !ranges) return null;

  const payload: TileSessionPayload = {
    exp: Date.now() + SESSION_TTL_MS,
    purpose: 'offline-yandex-map',
    pointId,
    ranges,
  };
  const encodedPayload = encode(JSON.stringify(payload));

  return `${encodedPayload}.${sign(encodedPayload)}`;
}

export function verifyOfflineMapSession(value: unknown): TileSessionPayload | null {
  if (typeof value !== 'string' || !hasYandexTilesApiKey()) return null;

  const [encodedPayload, signature, ...rest] = value.split('.');
  if (!encodedPayload || !signature || rest.length > 0) return null;

  const expected = Buffer.from(sign(encodedPayload));
  const actual = Buffer.from(signature);
  if (expected.length !== actual.length || !timingSafeEqual(expected, actual)) return null;

  try {
    const payload = JSON.parse(
      Buffer.from(encodedPayload, 'base64url').toString()
    ) as TileSessionPayload;

    return payload.purpose === 'offline-yandex-map' && payload.exp > Date.now() ? payload : null;
  } catch {
    return null;
  }
}

export function isAllowedOfflineTile(
  payload: TileSessionPayload,
  x: number,
  y: number,
  z: number
): boolean {
  if (!Number.isInteger(x) || !Number.isInteger(y) || !Number.isInteger(z)) return false;
  const range = payload.ranges.find((candidate) => candidate.z === z);

  return Boolean(range && x >= range.minX && x <= range.maxX && y >= range.minY && y <= range.maxY);
}

export function buildYandexTileUrl(x: number, y: number, z: number): URL {
  const url = new URL('https://tiles.api-maps.yandex.ru/v1/tiles/');
  url.searchParams.set('apikey', getTilesApiKey());
  url.searchParams.set('lang', 'ru_RU');
  url.searchParams.set('l', 'map');
  url.searchParams.set('maptype', 'map');
  url.searchParams.set('projection', 'web_mercator');
  url.searchParams.set('x', String(x));
  url.searchParams.set('y', String(y));
  url.searchParams.set('z', String(z));

  return url;
}
