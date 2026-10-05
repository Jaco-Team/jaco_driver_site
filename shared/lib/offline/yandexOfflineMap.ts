import type { HomeLocation, Order } from '@/entities/order/model/order.types';
import { ensureOfflineMapAssets } from '@/shared/lib/offline/offlineMapAssets';
import { createOfflineTileFetcher } from '@/shared/lib/offline/offlineTileFetcher';
import { getOfflineMapRegionId } from './offlineMapRegionId';
import { loadOfflineMapRuntime } from './offlineMapRuntime';
import {
  getMarkerOfflineDetailPlans,
  getViewedOfflineDetailPlans,
  OFFLINE_DETAIL_MAX_BYTES,
  OFFLINE_DETAIL_MAX_REGIONS,
  OFFLINE_DETAIL_MAX_TILES,
  type OfflineDetailTile,
  type OfflineDetailPlan,
} from './offlineMapDetails';
import {
  getOfflineMapCity,
  findOfflineMapCity,
  OFFLINE_CITY_MIN_ZOOM,
  OFFLINE_CITY_MAX_ZOOM,
  OFFLINE_CITY_MAX_TILES,
} from '@/shared/config/offlineMapCities';

export const YANDEX_OFFLINE_TILE_CACHE = 'jaco-yandex-offline-tiles-v1';
export const YANDEX_OFFLINE_METADATA_KEY = 'jaco_yandex_offline_maps_v2';
export const YANDEX_OFFLINE_MAP_EVENT = 'jaco-offline-map-updated';
export const YANDEX_OFFLINE_MAX_AGE_MS = 29 * 24 * 60 * 60 * 1000;
export const YANDEX_OFFLINE_CITY_DOWNLOADS_KEY = 'jaco_offline_city_downloads_v1';

const MIN_ZOOM = 10;
const MAX_ZOOM = 15;
const MAX_TILES = 1500;
const MAX_CACHED_POINTS = 8;
const DOWNLOAD_WORKERS = 4;
const REFRESH_BEFORE_EXPIRY_MS = 24 * 60 * 60 * 1000;
const LEGACY_METADATA_KEY = 'jaco_yandex_offline_map_v1';
const COVERAGE_VERSION = 2;

export interface OfflineMapBounds {
  west: number;
  south: number;
  east: number;
  north: number;
}

export interface OfflineMapTile {
  x: number;
  y: number;
  z: number;
}

export interface OfflineMapMetadata {
  kind?: 'detail';
  parentCityId?: string;
  cityId?: string;
  pointId: string;
  coverageVersion: number;
  bounds: OfflineMapBounds;
  minZoom: number;
  maxZoom: number;
  initialZoom: number;
  cameraMinZoom: number;
  cameraMaxZoom: number;
  tileCount: number;
  byteSize: number;
  savedAt: number;
  expiresAt: number;
  lastUsedAt: number;
}

export interface OfflineMapRegistry {
  version: 2;
  regions: Record<string, OfflineMapMetadata>;
}

export interface OfflineMapDownloadProgress {
  pointId: string;
  completed: number;
  total: number;
  byteSize: number;
  status: 'downloading' | 'ready' | 'paused' | 'error';
  error?: string;
}

export interface PendingCityDownload extends OfflineMapDownloadProgress {
  cityId: string;
  updatedAt: number;
  refreshAfter?: number;
  autoResume?: boolean;
}

export function getOfflineCityPlan(cityId: string) {
  const city = getOfflineMapCity(cityId);
  if (!city) throw new Error('Город недоступен для скачивания.');
  const tileCount = listOfflineMapTiles(
    city.bounds,
    OFFLINE_CITY_MIN_ZOOM,
    OFFLINE_CITY_MAX_ZOOM
  ).length;
  return {
    cityId,
    name: city.name,
    pointId: `city:${cityId}`,
    bounds: city.bounds,
    minZoom: OFFLINE_CITY_MIN_ZOOM,
    maxZoom: OFFLINE_CITY_MAX_ZOOM,
    initialZoom: 11,
    cameraMinZoom: OFFLINE_CITY_MIN_ZOOM - 1,
    cameraMaxZoom: OFFLINE_CITY_MAX_ZOOM - 1,
    tileCount,
    // PNG sizes vary; this is a planning estimate, not a download guarantee.
    estimatedBytes: tileCount * 40 * 1024,
  };
}

export function readPendingCityDownloads(): PendingCityDownload[] {
  if (typeof window === 'undefined') return [];
  try {
    const items: unknown = JSON.parse(
      localStorage.getItem(YANDEX_OFFLINE_CITY_DOWNLOADS_KEY) || '[]'
    );
    return Array.isArray(items)
      ? items.filter((item): item is PendingCityDownload =>
          Boolean(
            item &&
            getOfflineMapCity(item.cityId) &&
            item.pointId === `city:${item.cityId}` &&
            ['downloading', 'paused', 'error'].includes(item.status) &&
            Number.isInteger(item.completed) &&
            item.completed >= 0 &&
            Number.isInteger(item.total) &&
            item.total > 0 &&
            item.total <= OFFLINE_CITY_MAX_TILES &&
            item.completed <= item.total &&
            Number.isFinite(item.byteSize) &&
            item.byteSize >= 0 &&
            (item.refreshAfter === undefined || Number.isFinite(item.refreshAfter)) &&
            (item.autoResume === undefined || typeof item.autoResume === 'boolean') &&
            (item.error === undefined || typeof item.error === 'string') &&
            Number.isFinite(item.updatedAt) &&
            item.updatedAt + YANDEX_OFFLINE_MAX_AGE_MS > Date.now()
          )
        )
      : [];
  } catch {
    return [];
  }
}

function savePendingCityDownload(item: PendingCityDownload | null, cityId: string): void {
  const items = readPendingCityDownloads().filter((entry) => entry.cityId !== cityId);
  if (item) items.push(item);
  try {
    localStorage.setItem(YANDEX_OFFLINE_CITY_DOWNLOADS_KEY, JSON.stringify(items));
  } catch {
    throw new Error(
      'Не удалось сохранить состояние загрузки на устройстве. Проверьте доступ к памяти браузера.'
    );
  }
}

export function setCityDownloadAutoResume(cityId: string, autoResume: boolean): void {
  const item = readPendingCityDownloads().find((entry) => entry.cityId === cityId);
  if (item) savePendingCityDownload({ ...item, autoResume }, cityId);
}

async function waitForPreparation<T>(operation: Promise<T>, signal: AbortSignal): Promise<T> {
  signal.throwIfAborted();
  return new Promise((resolve, reject) => {
    const onAbort = () => reject(signal.reason);
    signal.addEventListener('abort', onAbort, { once: true });
    operation.then(resolve, reject).finally(() => signal.removeEventListener('abort', onAbort));
  });
}

function getDownloadError(error: unknown): string {
  if (error instanceof DOMException && error.name === 'QuotaExceededError') {
    return 'Недостаточно места для карты. Освободите память и продолжите скачивание.';
  }
  if (error instanceof TypeError) {
    return 'Не удалось загрузить карту. Проверьте подключение к интернету и продолжите скачивание.';
  }
  return error instanceof Error ? error.message : 'Не удалось сохранить карту.';
}

interface SyncInput {
  authToken: string;
  pointId: string;
  home: HomeLocation | null;
  orders: Order[];
}

const pendingSyncs = new Map<string, SyncInput>();
const activeSyncs = new Map<string, Promise<OfflineMapMetadata | null>>();
let downloadQueue: Promise<unknown> = Promise.resolve();
let activeDetailSync: Promise<void> | null = null;
let detailController: AbortController | null = null;
let detailRetryAfter = 0;
const pendingDetails = new Map<string, { plan: OfflineDetailPlan; authToken: string }>();
const recentlySavedDetails = new Map<string, number>();

export function cancelOfflineMapDetailDownloads(): void {
  pendingDetails.clear();
  detailController?.abort();
}

export function scheduleOfflineMapDetailSync(input: {
  authToken: string;
  coordinates?: readonly (readonly number[])[];
  viewport?: OfflineMapBounds;
  zoom?: number;
}): Promise<void> {
  if (
    typeof window === 'undefined' ||
    !('caches' in window) ||
    navigator.onLine === false ||
    !input.authToken.trim() ||
    Date.now() < detailRetryAfter
  )
    return Promise.resolve();
  const plans = [
    ...getMarkerOfflineDetailPlans(input.coordinates ?? []),
    ...(input.viewport ? getViewedOfflineDetailPlans(input.viewport, input.zoom ?? 0) : []),
  ];
  for (const plan of plans) {
    const pending = pendingDetails.get(plan.pointId);
    if (!pending && pendingDetails.size >= OFFLINE_DETAIL_MAX_REGIONS) continue;
    if (!pending || pending.plan.maxZoom < plan.maxZoom)
      pendingDetails.set(plan.pointId, { plan, authToken: input.authToken });
  }
  if (activeDetailSync) return activeDetailSync;
  if (!pendingDetails.size) return Promise.resolve();
  const controller = new AbortController();
  detailController = controller;
  activeDetailSync = (async () => {
    let cachedUrls: Set<string> | null = null;
    while (pendingDetails.size && !controller.signal.aborted) {
      const next = pendingDetails.values().next().value!;
      pendingDetails.delete(next.plan.pointId);
      const queued = downloadQueue.then(async () => {
        controller.signal.throwIfAborted();
        if (
          navigator.onLine === false ||
          readPendingCityDownloads().some((item) => item.status === 'downloading')
        )
          return;
        const registry = readOfflineMapRegistry();
        const { plan, authToken } = next;
        const center = {
          west: (plan.bounds.west + plan.bounds.east) / 2,
          east: (plan.bounds.west + plan.bounds.east) / 2,
          south: (plan.bounds.south + plan.bounds.north) / 2,
          north: (plan.bounds.south + plan.bounds.north) / 2,
        };
        if (
          !Object.values(registry.regions).some(
            (region) =>
              region.kind !== 'detail' &&
              region.expiresAt > Date.now() &&
              containsBounds(region.bounds, center)
          )
        )
          return;
        const current = readOfflineMapMetadata(plan.pointId);
        // Avoid repeatedly downloading cells just evicted by the bounded cache.
        if (!current && (recentlySavedDetails.get(plan.pointId) ?? 0) + 10 * 60_000 > Date.now())
          return;
        if (
          current &&
          current.maxZoom >= plan.maxZoom &&
          current.expiresAt > Date.now() + REFRESH_BEFORE_EXPIRY_MS
        ) {
          if (!cachedUrls) {
            const cache = await caches.open(YANDEX_OFFLINE_TILE_CACHE);
            cachedUrls = new Set((await cache.keys()).map((request) => request.url));
          }
          if (
            listOfflineMapTiles(current.bounds, current.minZoom, current.maxZoom).every((tile) =>
              cachedUrls!.has(getOfflineTileUrl(tile))
            )
          ) {
            current.lastUsedAt = Date.now();
            registry.regions[current.pointId] = current;
            writeRegistry(registry);
            return;
          }
        }
        const storage = await navigator.storage?.estimate?.();
        if (storage?.quota && storage.quota - (storage.usage ?? 0) < 8 * 1024 * 1024) return;
        await ensureOfflineMapAssets();
        await downloadRegion({ ...plan, authToken, signal: controller.signal });
        cachedUrls = null;
        recentlySavedDetails.set(plan.pointId, Date.now());
        if (recentlySavedDetails.size > OFFLINE_DETAIL_MAX_REGIONS * 2)
          recentlySavedDetails.delete(recentlySavedDetails.keys().next().value!);
      });
      downloadQueue = queued.catch(() => undefined);
      await queued;
    }
  })()
    .catch(async (error) => {
      pendingDetails.clear();
      if (!controller.signal.aborted) detailRetryAfter = Date.now() + 60_000;
      const cleanup = downloadQueue.then(() => pruneOldRegions(readOfflineMapRegistry()));
      downloadQueue = cleanup.catch(() => undefined);
      await cleanup.catch(() => undefined);
      if (!controller.signal.aborted) throw error;
    })
    .finally(() => {
      activeDetailSync = null;
      if (detailController === controller) detailController = null;
    });
  return activeDetailSync;
}

function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}

function isCoordinate(latitude: unknown, longitude: unknown): boolean {
  const lat = Number(latitude);
  const lon = Number(longitude);

  return (
    Number.isFinite(lat) &&
    Number.isFinite(lon) &&
    lat >= -85.05112878 &&
    lat <= 85.05112878 &&
    lon >= -180 &&
    lon <= 180
  );
}

function coordinateToTile(
  longitude: number,
  latitude: number,
  zoom: number
): { x: number; y: number } {
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

function coordinateToWorldPixel(longitude: number, latitude: number, zoom: number) {
  const worldSize = 512 * 2 ** zoom;
  const latitudeRadians = (latitude * Math.PI) / 180;

  return {
    x: ((longitude + 180) / 360) * worldSize,
    y: ((1 - Math.asinh(Math.tan(latitudeRadians)) / Math.PI) / 2) * worldSize,
    worldSize,
  };
}

function worldPixelToCoordinate(x: number, y: number, worldSize: number) {
  const longitude = (x / worldSize) * 360 - 180;
  const mercator = Math.PI * (1 - (2 * y) / worldSize);
  const latitude = (Math.atan(Math.sinh(mercator)) * 180) / Math.PI;

  return { latitude, longitude };
}

function getZoomPlan(home: HomeLocation | null) {
  const onlineZoom = Number.isFinite(Number(home?.zoom)) ? Number(home?.zoom) : 12;
  const initialZoom = clamp(onlineZoom - 1, MIN_ZOOM - 1, MAX_ZOOM - 1);
  const cameraMinZoom = clamp(initialZoom - 1, MIN_ZOOM - 1, initialZoom);
  const cameraMaxZoom = clamp(initialZoom + 2, initialZoom, MAX_ZOOM - 1);

  return {
    initialZoom,
    cameraMinZoom,
    cameraMaxZoom,
    minZoom: clamp(Math.floor(cameraMinZoom) + 1, MIN_ZOOM, MAX_ZOOM),
    maxZoom: clamp(Math.ceil(cameraMaxZoom) + 1, MIN_ZOOM, MAX_ZOOM),
  };
}

function buildViewportBounds(home: HomeLocation, cameraZoom: number): OfflineMapBounds | null {
  if (!isCoordinate(home.center?.[0], home.center?.[1])) return null;

  const latitude = Number(home.center[0]);
  const longitude = Number(home.center[1]);
  const center = coordinateToWorldPixel(longitude, latitude, cameraZoom);
  const viewportWidth = typeof window === 'undefined' ? 440 : window.innerWidth;
  const viewportHeight = typeof window === 'undefined' ? 900 : window.innerHeight;
  const width = clamp(viewportWidth * 1.4, 504, 1600);
  const height = clamp(viewportHeight * 1.4, 896, 1400);
  const topLeft = worldPixelToCoordinate(
    center.x - width / 2,
    center.y - height / 2,
    center.worldSize
  );
  const bottomRight = worldPixelToCoordinate(
    center.x + width / 2,
    center.y + height / 2,
    center.worldSize
  );

  return normalizeBounds({
    west: topLeft.longitude,
    north: topLeft.latitude,
    east: bottomRight.longitude,
    south: bottomRight.latitude,
  });
}

function normalizeBounds(bounds: OfflineMapBounds): OfflineMapBounds {
  const west = clamp(Math.min(bounds.west, bounds.east), -180, 180);
  const east = clamp(Math.max(bounds.west, bounds.east), -180, 180);
  const south = clamp(Math.min(bounds.south, bounds.north), -85.05112878, 85.05112878);
  const north = clamp(Math.max(bounds.south, bounds.north), -85.05112878, 85.05112878);

  return { west, south, east, north };
}

function mergeBounds(first: OfflineMapBounds, second: OfflineMapBounds): OfflineMapBounds {
  return normalizeBounds({
    west: Math.min(first.west, second.west),
    south: Math.min(first.south, second.south),
    east: Math.max(first.east, second.east),
    north: Math.max(first.north, second.north),
  });
}

function containsBounds(container: OfflineMapBounds, target: OfflineMapBounds): boolean {
  return (
    container.west <= target.west &&
    container.south <= target.south &&
    container.east >= target.east &&
    container.north >= target.north
  );
}

export function buildOfflineMapBounds(
  home: HomeLocation | null,
  orders: Order[],
  cameraMinZoom = getZoomPlan(home).cameraMinZoom
): OfflineMapBounds | null {
  const coordinates: Array<[number, number]> = [];

  if (home && isCoordinate(home.center?.[0], home.center?.[1])) {
    coordinates.push([Number(home.center[0]), Number(home.center[1])]);
  }

  for (const order of orders) {
    if (isCoordinate(order.xy?.latitude, order.xy?.longitude)) {
      coordinates.push([Number(order.xy?.latitude), Number(order.xy?.longitude)]);
    }
  }

  if (coordinates.length === 0) return null;

  const latitudes = coordinates.map(([latitude]) => latitude);
  const longitudes = coordinates.map(([, longitude]) => longitude);
  const south = Math.min(...latitudes);
  const north = Math.max(...latitudes);
  const west = Math.min(...longitudes);
  const east = Math.max(...longitudes);
  const latitudePadding = Math.max(0.025, (north - south) * 0.18);
  const longitudePadding = Math.max(0.035, (east - west) * 0.18);

  const orderBounds = normalizeBounds({
    west: west - longitudePadding,
    south: south - latitudePadding,
    east: east + longitudePadding,
    north: north + latitudePadding,
  });
  const viewportBounds = home ? buildViewportBounds(home, cameraMinZoom) : null;

  return viewportBounds ? mergeBounds(orderBounds, viewportBounds) : orderBounds;
}

export function listOfflineMapTiles(
  bounds: OfflineMapBounds,
  minZoom = MIN_ZOOM,
  maxZoom = MAX_ZOOM
): OfflineMapTile[] {
  const normalized = normalizeBounds(bounds);
  const tiles: OfflineMapTile[] = [];

  for (let zoom = minZoom; zoom <= maxZoom; zoom += 1) {
    const topLeft = coordinateToTile(normalized.west, normalized.north, zoom);
    const bottomRight = coordinateToTile(normalized.east, normalized.south, zoom);

    for (let x = topLeft.x; x <= bottomRight.x; x += 1) {
      for (let y = topLeft.y; y <= bottomRight.y; y += 1) {
        tiles.push({ x, y, z: zoom });
      }
    }
  }

  return tiles;
}

export function getOfflineTileUrl(tile: OfflineMapTile): string {
  return new URL(`/offline-map/yandex/${tile.z}/${tile.x}/${tile.y}.png`, window.location.origin)
    .href;
}

function emptyRegistry(): OfflineMapRegistry {
  return { version: 2, regions: {} };
}

export function readOfflineMapRegistry(): OfflineMapRegistry {
  if (typeof window === 'undefined') return emptyRegistry();

  try {
    const registry = JSON.parse(
      window.localStorage.getItem(YANDEX_OFFLINE_METADATA_KEY) || 'null'
    ) as OfflineMapRegistry | null;

    return registry?.version === 2 && registry.regions ? registry : emptyRegistry();
  } catch {
    return emptyRegistry();
  }
}

export function readOfflineMapMetadata(pointId: number | string | null): OfflineMapMetadata | null {
  if (pointId === null || pointId === undefined) return null;

  const metadata = readOfflineMapRegistry().regions[String(pointId)] ?? null;
  return metadata && metadata.expiresAt > Date.now() ? metadata : null;
}

export async function validateOfflineCityMaps(): Promise<Record<string, OfflineMapMetadata>> {
  const snapshot = readOfflineMapRegistry();
  if (typeof window === 'undefined' || !('caches' in window)) return snapshot.regions;
  const cache = await caches.open(YANDEX_OFFLINE_TILE_CACHE);
  const urls = new Set((await cache.keys()).map((request) => request.url));
  const missing = Object.values(snapshot.regions).filter(
    (metadata) =>
      metadata.cityId &&
      !listOfflineMapTiles(metadata.bounds, metadata.minZoom, metadata.maxZoom).every((tile) =>
        urls.has(getOfflineTileUrl(tile))
      )
  );
  const current = readOfflineMapRegistry();
  for (const metadata of missing) {
    if (
      current.regions[metadata.pointId]?.savedAt === metadata.savedAt &&
      current.regions[metadata.pointId]?.lastUsedAt === metadata.lastUsedAt
    ) {
      delete current.regions[metadata.pointId];
    }
  }
  if (missing.length) writeRegistry(current);
  return current.regions;
}

function writeRegistry(registry: OfflineMapRegistry): void {
  window.localStorage.setItem(YANDEX_OFFLINE_METADATA_KEY, JSON.stringify(registry));
  window.localStorage.removeItem(LEGACY_METADATA_KEY);
}

function dispatchProgress(progress: OfflineMapDownloadProgress): void {
  window.dispatchEvent(new CustomEvent(YANDEX_OFFLINE_MAP_EVENT, { detail: progress }));
}

export async function deleteOfflineYandexMap(pointId?: number | string): Promise<void> {
  if (typeof window === 'undefined') return;
  cancelOfflineMapDetailDownloads();
  await activeDetailSync?.catch(() => undefined);
  recentlySavedDetails.clear();

  if (pointId === undefined) {
    await caches.delete(YANDEX_OFFLINE_TILE_CACHE);
    window.localStorage.removeItem(YANDEX_OFFLINE_METADATA_KEY);
    window.localStorage.removeItem(LEGACY_METADATA_KEY);
    window.localStorage.removeItem(YANDEX_OFFLINE_CITY_DOWNLOADS_KEY);
  } else {
    const registry = readOfflineMapRegistry();
    const cityId = String(pointId).startsWith('city:') ? String(pointId).slice(5) : null;
    if (cityId) savePendingCityDownload(null, cityId);
    delete registry.regions[String(pointId)];
    if (cityId) {
      for (const metadata of Object.values(registry.regions)) {
        if (metadata.kind === 'detail' && metadata.parentCityId === cityId)
          delete registry.regions[metadata.pointId];
      }
    }
    writeRegistry(registry);
    await removeUnreferencedTiles(registry);
  }

  dispatchProgress({
    pointId: pointId === undefined ? '*' : String(pointId),
    completed: 0,
    total: 0,
    byteSize: 0,
    status: 'ready',
  });
}

async function openDownloadSession(
  authToken: string,
  pointId: string,
  bounds: OfflineMapBounds,
  minZoom: number,
  maxZoom: number,
  cityId?: string,
  signal?: AbortSignal,
  detailTile?: OfflineDetailTile
): Promise<string> {
  const response = await fetch('/api/offline-map/session', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${authToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ pointId, bounds, minZoom, maxZoom, cityId, detailTile }),
    cache: 'no-store',
    signal,
  });
  const payload = (await response.json().catch(() => ({}))) as { session?: string; error?: string };

  if (!response.ok || !payload.session) {
    throw new Error(payload.error || 'Не удалось начать фоновое сохранение карты.');
  }

  return payload.session;
}

function isFreshCachedTile(response: Response | undefined): response is Response {
  if (!response) return false;
  const savedAt = Number(response.headers.get('X-Offline-Saved-At'));
  return Number.isFinite(savedAt) && savedAt + YANDEX_OFFLINE_MAX_AGE_MS > Date.now();
}

async function removeUnreferencedTiles(registry: OfflineMapRegistry): Promise<void> {
  const cache = await caches.open(YANDEX_OFFLINE_TILE_CACHE);
  const retained = new Set<string>();

  for (const metadata of Object.values(registry.regions)) {
    if (metadata.expiresAt <= Date.now()) continue;
    for (const tile of listOfflineMapTiles(metadata.bounds, metadata.minZoom, metadata.maxZoom)) {
      retained.add(getOfflineTileUrl(tile));
    }
  }

  for (const pending of readPendingCityDownloads()) {
    const plan = getOfflineCityPlan(pending.cityId);
    for (const tile of listOfflineMapTiles(plan.bounds, plan.minZoom, plan.maxZoom)) {
      retained.add(getOfflineTileUrl(tile));
    }
  }

  const requests = await cache.keys();
  await Promise.all(
    requests.filter((request) => !retained.has(request.url)).map((request) => cache.delete(request))
  );
}

async function pruneOldRegions(registry: OfflineMapRegistry): Promise<OfflineMapRegistry> {
  const fresh = Object.values(registry.regions)
    .filter((metadata) => metadata.expiresAt > Date.now())
    .sort((a, b) => b.lastUsedAt - a.lastUsedAt);
  let detailBytes = 0;
  let detailCount = 0;
  const details = fresh.filter((metadata) => {
    if (metadata.kind !== 'detail') return false;
    if (
      detailCount >= OFFLINE_DETAIL_MAX_REGIONS ||
      detailBytes + metadata.byteSize > OFFLINE_DETAIL_MAX_BYTES
    )
      return false;
    detailBytes += metadata.byteSize;
    detailCount += 1;
    return true;
  });
  const regions = fresh
    .filter((metadata) => metadata.kind !== 'detail')
    .sort(
      (a, b) => Number(Boolean(b.cityId)) - Number(Boolean(a.cityId)) || b.lastUsedAt - a.lastUsedAt
    )
    .slice(0, MAX_CACHED_POINTS);
  const next = {
    version: 2 as const,
    regions: Object.fromEntries(
      [...regions, ...details].map((metadata) => [metadata.pointId, metadata])
    ),
  };

  writeRegistry(next);
  await removeUnreferencedTiles(next);
  return next;
}

async function downloadRegion(options: {
  authToken: string;
  pointId: string;
  bounds: OfflineMapBounds;
  minZoom: number;
  maxZoom: number;
  initialZoom: number;
  cameraMinZoom: number;
  cameraMaxZoom: number;
  cityId?: string;
  signal?: AbortSignal;
  refreshAfter?: number;
  kind?: 'detail';
  parentCityId?: string;
  detailTile?: OfflineDetailTile;
}): Promise<OfflineMapMetadata> {
  const tiles = listOfflineMapTiles(options.bounds, options.minZoom, options.maxZoom);

  const maxTiles =
    options.kind === 'detail'
      ? OFFLINE_DETAIL_MAX_TILES
      : options.cityId
        ? OFFLINE_CITY_MAX_TILES
        : MAX_TILES;
  if (tiles.length > maxTiles) {
    throw new Error(
      `Область карты слишком большая: ${tiles.length} тайлов. Максимум — ${maxTiles}.`
    );
  }

  const controller = new AbortController();
  const onAbort = () => controller.abort(options.signal?.reason);
  options.signal?.addEventListener('abort', onAbort, { once: true });
  if (options.signal?.aborted) onAbort();
  const fetchTile = createOfflineTileFetcher();
  let cursor = 0;
  let completed = 0;
  let byteSize = 0;
  let oldestSavedAt = Date.now();

  let lastPersistedAt = 0;
  let lastReportedAt = 0;
  const resumedCompleted = options.cityId
    ? (readPendingCityDownloads().find((item) => item.cityId === options.cityId)?.completed ?? 0)
    : 0;
  const report = (status: OfflineMapDownloadProgress['status'], error?: string) => {
    // Keep saved progress visible while workers recheck already downloaded tiles.
    if (status === 'downloading' && completed < resumedCompleted) return;
    const progress: OfflineMapDownloadProgress = {
      pointId: options.pointId,
      completed,
      total: tiles.length,
      byteSize,
      status,
      error,
    };
    if (options.cityId && (status !== 'downloading' || Date.now() - lastPersistedAt >= 1000)) {
      savePendingCityDownload(
        status === 'ready'
          ? null
          : {
              ...progress,
              cityId: options.cityId,
              updatedAt: Date.now(),
              refreshAfter: options.refreshAfter,
              autoResume: readPendingCityDownloads().find((item) => item.cityId === options.cityId)
                ?.autoResume,
            },
        options.cityId
      );
      lastPersistedAt = Date.now();
    }
    if (status === 'downloading' && completed !== tiles.length && Date.now() - lastReportedAt < 250)
      return;
    lastReportedAt = Date.now();
    dispatchProgress(progress);
  };
  let workers: Promise<void>[] = [];
  try {
    report('downloading');
    controller.signal.throwIfAborted();
    const session = await openDownloadSession(
      options.authToken,
      options.pointId,
      options.bounds,
      options.minZoom,
      options.maxZoom,
      options.cityId,
      controller.signal,
      options.detailTile
    );
    const cache = await caches.open(YANDEX_OFFLINE_TILE_CACHE);

    const worker = async () => {
      while (cursor < tiles.length) {
        controller.signal.throwIfAborted();
        const tile = tiles[cursor];
        cursor += 1;
        const cacheRequest = new Request(getOfflineTileUrl(tile));
        const cached = await cache.match(cacheRequest);

        if (
          isFreshCachedTile(cached) &&
          (!options.refreshAfter ||
            Number(cached.headers.get('X-Offline-Saved-At')) >= options.refreshAfter)
        ) {
          const savedAt = Number(cached.headers.get('X-Offline-Saved-At'));
          oldestSavedAt = Math.min(oldestSavedAt, savedAt);
          byteSize += Number(cached.headers.get('Content-Length') || 0);
          completed += 1;
          report('downloading');
          continue;
        }

        const query = new URLSearchParams({
          x: String(tile.x),
          y: String(tile.y),
          z: String(tile.z),
          session,
        });
        let response: Response | undefined;
        for (let attempt = 0; attempt < 3; attempt += 1) {
          response = await fetchTile(`/api/offline-map/yandex-tile?${query}`, controller.signal);
          if (response.ok || response.status < 500) break;
          if (attempt < 2) await response.body?.cancel();
        }

        if (!response?.ok) {
          const payload = (await response?.json().catch(() => ({}))) as
            { error?: string } | undefined;
          throw new Error(
            payload?.error || `Не удалось загрузить тайл ${tile.z}/${tile.x}/${tile.y}.`
          );
        }

        const blob = await response.blob();
        controller.signal.throwIfAborted();
        const savedAt = Date.now();
        await cache.put(
          cacheRequest,
          new Response(blob, {
            headers: {
              'Content-Type': response.headers.get('Content-Type') || 'image/png',
              'Content-Length': String(blob.size),
              'X-Offline-Saved-At': String(savedAt),
            },
          })
        );
        oldestSavedAt = Math.min(oldestSavedAt, savedAt);
        byteSize += blob.size;
        completed += 1;
        report('downloading');
      }
    };

    workers = Array.from({ length: DOWNLOAD_WORKERS }, () => worker());
    await Promise.all(workers);
    controller.signal.throwIfAborted();

    const metadata: OfflineMapMetadata = {
      kind: options.kind,
      parentCityId: options.parentCityId,
      cityId: options.cityId,
      pointId: options.pointId,
      coverageVersion: COVERAGE_VERSION,
      bounds: options.bounds,
      minZoom: options.minZoom,
      maxZoom: options.maxZoom,
      initialZoom: options.initialZoom,
      cameraMinZoom: options.cameraMinZoom,
      cameraMaxZoom: options.cameraMaxZoom,
      tileCount: tiles.length,
      byteSize,
      savedAt: oldestSavedAt,
      expiresAt: oldestSavedAt + YANDEX_OFFLINE_MAX_AGE_MS,
      lastUsedAt: Date.now(),
    };
    const registry = readOfflineMapRegistry();
    registry.regions[options.pointId] = metadata;
    writeRegistry(registry);
    await pruneOldRegions(registry);
    report('ready');
    void navigator.storage?.persist?.().catch(() => false);

    return metadata;
  } catch (error) {
    controller.abort();
    await Promise.allSettled(workers);
    report(
      options.signal?.aborted ? 'paused' : 'error',
      options.signal?.aborted ? undefined : getDownloadError(error)
    );
    throw error;
  } finally {
    options.signal?.removeEventListener('abort', onAbort);
  }
}

export function downloadOfflineCityMap(
  cityId: string,
  authToken: string,
  signal: AbortSignal,
  refresh = false
): Promise<OfflineMapMetadata> {
  const plan = getOfflineCityPlan(cityId);
  const pending = readPendingCityDownloads().find((item) => item.cityId === cityId);
  const refreshAfter = refresh ? Date.now() : pending?.refreshAfter;
  const initial: PendingCityDownload = {
    cityId,
    pointId: plan.pointId,
    completed: pending?.completed ?? 0,
    total: plan.tileCount,
    byteSize: pending?.byteSize ?? 0,
    status: 'downloading',
    updatedAt: Date.now(),
    refreshAfter,
    autoResume: true,
  };
  savePendingCityDownload(initial, cityId);
  dispatchProgress(initial);
  const previousQueue = downloadQueue;
  const queued = previousQueue.then(async () => {
    signal.throwIfAborted();
    if (!authToken) throw new Error('Войдите в аккаунт перед скачиванием карты.');
    if (!('caches' in window)) throw new Error('Браузер не поддерживает сохранение карты.');
    const storage = await navigator.storage?.estimate?.();
    const existing = readOfflineMapMetadata(plan.pointId);
    const reusableTiles = existing && !refreshAfter ? existing.tileCount : 0;
    const remainingBytes = refreshAfter
      ? 8 * 1024 * 1024
      : Math.max(0, plan.estimatedBytes - Math.max(initial.byteSize, reusableTiles * 40 * 1024)) +
        8 * 1024 * 1024;
    if (storage?.quota && storage.quota - (storage.usage ?? 0) < remainingBytes) {
      throw new Error('Недостаточно места для карты. Освободите память и повторите скачивание.');
    }
    await waitForPreparation(ensureOfflineMapAssets(), signal);
    signal.throwIfAborted();
    await waitForPreparation(loadOfflineMapRuntime(), signal);
    signal.throwIfAborted();
    return downloadRegion({ ...plan, authToken, signal, refreshAfter });
  });
  downloadQueue = queued.catch(() => undefined);
  return waitForPreparation(previousQueue, signal)
    .then(() => queued)
    .catch((error) => {
      const previous = readPendingCityDownloads().find((item) => item.cityId === cityId) ?? initial;
      const progress: PendingCityDownload = {
        ...previous,
        status: signal.aborted ? 'paused' : 'error',
        updatedAt: Date.now(),
        error: signal.aborted ? undefined : getDownloadError(error),
      };
      savePendingCityDownload(progress, cityId);
      dispatchProgress(progress);
      if (signal.aborted) throw error;
      throw new Error(progress.error, { cause: error });
    });
}

async function syncOnce(input: SyncInput): Promise<OfflineMapMetadata | null> {
  if (typeof window === 'undefined' || !('caches' in window) || navigator.onLine === false) {
    return null;
  }

  if (readPendingCityDownloads().some((item) => item.status === 'downloading')) return null;
  const city = input.home
    ? findOfflineMapCity(input.home.center[0], input.home.center[1])
    : undefined;
  const cityMap = city ? readOfflineMapMetadata(`city:${city.id}`) : null;
  const ordersWithinCity =
    city &&
    input.orders.every(
      (order) =>
        !isCoordinate(order.xy?.latitude, order.xy?.longitude) ||
        (Number(order.xy?.latitude) >= city.bounds.south &&
          Number(order.xy?.latitude) <= city.bounds.north &&
          Number(order.xy?.longitude) >= city.bounds.west &&
          Number(order.xy?.longitude) <= city.bounds.east)
    );
  if (cityMap && ordersWithinCity && cityMap.expiresAt > Date.now() + REFRESH_BEFORE_EXPIRY_MS)
    return cityMap;

  const zoomPlan = getZoomPlan(input.home);
  const desiredBounds = buildOfflineMapBounds(input.home, input.orders, zoomPlan.cameraMinZoom);
  if (!desiredBounds) return null;

  await ensureOfflineMapAssets();

  let maxZoom = zoomPlan.maxZoom;
  let cameraMaxZoom = zoomPlan.cameraMaxZoom;
  while (
    maxZoom > zoomPlan.minZoom &&
    listOfflineMapTiles(desiredBounds, zoomPlan.minZoom, maxZoom).length > MAX_TILES
  ) {
    maxZoom -= 1;
    cameraMaxZoom = Math.min(cameraMaxZoom, maxZoom - 1);
  }

  const registry = readOfflineMapRegistry();
  const current = registry.regions[input.pointId];
  if (
    current &&
    current.coverageVersion === COVERAGE_VERSION &&
    current.expiresAt > Date.now() + REFRESH_BEFORE_EXPIRY_MS &&
    current.minZoom === zoomPlan.minZoom &&
    current.maxZoom === maxZoom &&
    current.initialZoom === zoomPlan.initialZoom &&
    current.cameraMinZoom === zoomPlan.cameraMinZoom &&
    current.cameraMaxZoom === cameraMaxZoom &&
    containsBounds(current.bounds, desiredBounds)
  ) {
    current.lastUsedAt = Date.now();
    writeRegistry(registry);
    return current;
  }

  const bounds =
    current?.coverageVersion === COVERAGE_VERSION &&
    current.expiresAt &&
    current.expiresAt > Date.now()
      ? mergeBounds(current.bounds, desiredBounds)
      : desiredBounds;

  const queued = downloadQueue.then(() =>
    downloadRegion({
      authToken: input.authToken,
      pointId: input.pointId,
      bounds,
      minZoom: zoomPlan.minZoom,
      maxZoom,
      initialZoom: zoomPlan.initialZoom,
      cameraMinZoom: zoomPlan.cameraMinZoom,
      cameraMaxZoom,
    })
  );
  downloadQueue = queued.catch(() => undefined);
  return queued;
}

export function scheduleOfflineYandexMapSync(options: {
  authToken: string;
  pointId: number | string | null;
  home: HomeLocation | null;
  orders: Order[];
}): Promise<OfflineMapMetadata | null> {
  const pointId = getOfflineMapRegionId(options.pointId, options.home);
  const authToken = options.authToken.trim();

  if (!pointId || !authToken || typeof window === 'undefined') return Promise.resolve(null);

  pendingSyncs.set(pointId, { ...options, pointId, authToken });
  const active = activeSyncs.get(pointId);
  if (active) return active;

  const task = (async () => {
    let result: OfflineMapMetadata | null = null;
    let next: SyncInput | undefined;

    while ((next = pendingSyncs.get(pointId))) {
      pendingSyncs.delete(pointId);
      result = await syncOnce(next);
    }

    return result;
  })().finally(() => {
    activeSyncs.delete(pointId);
  });

  activeSyncs.set(pointId, task);
  return task;
}
