import type { HomeLocation, Order } from '@/entities/order/model/order.types';
import { ensureOfflineMapAssets } from '@/shared/lib/offline/offlineMapAssets';
import { createOfflineTileFetcher } from '@/shared/lib/offline/offlineTileFetcher';

export const YANDEX_OFFLINE_TILE_CACHE = 'jaco-yandex-offline-tiles-v1';
export const YANDEX_OFFLINE_METADATA_KEY = 'jaco_yandex_offline_maps_v2';
export const YANDEX_OFFLINE_MAP_EVENT = 'jaco-offline-map-updated';
export const YANDEX_OFFLINE_MAX_AGE_MS = 29 * 24 * 60 * 60 * 1000;

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
  status: 'downloading' | 'ready' | 'error';
  error?: string;
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

function writeRegistry(registry: OfflineMapRegistry): void {
  window.localStorage.setItem(YANDEX_OFFLINE_METADATA_KEY, JSON.stringify(registry));
  window.localStorage.removeItem(LEGACY_METADATA_KEY);
}

function dispatchProgress(progress: OfflineMapDownloadProgress): void {
  window.dispatchEvent(new CustomEvent(YANDEX_OFFLINE_MAP_EVENT, { detail: progress }));
}

export async function deleteOfflineYandexMap(pointId?: number | string): Promise<void> {
  if (typeof window === 'undefined') return;

  if (pointId === undefined) {
    await caches.delete(YANDEX_OFFLINE_TILE_CACHE);
    window.localStorage.removeItem(YANDEX_OFFLINE_METADATA_KEY);
    window.localStorage.removeItem(LEGACY_METADATA_KEY);
  } else {
    const registry = readOfflineMapRegistry();
    delete registry.regions[String(pointId)];
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
  maxZoom: number
): Promise<string> {
  const response = await fetch('/api/offline-map/session', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${authToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ pointId, bounds, minZoom, maxZoom }),
    cache: 'no-store',
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

  const requests = await cache.keys();
  await Promise.all(
    requests.filter((request) => !retained.has(request.url)).map((request) => cache.delete(request))
  );
}

async function pruneOldRegions(registry: OfflineMapRegistry): Promise<OfflineMapRegistry> {
  const regions = Object.values(registry.regions)
    .filter((metadata) => metadata.expiresAt > Date.now())
    .sort((a, b) => b.lastUsedAt - a.lastUsedAt)
    .slice(0, MAX_CACHED_POINTS);
  const next = {
    version: 2 as const,
    regions: Object.fromEntries(regions.map((metadata) => [metadata.pointId, metadata])),
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
}): Promise<OfflineMapMetadata> {
  const tiles = listOfflineMapTiles(options.bounds, options.minZoom, options.maxZoom);

  if (tiles.length > MAX_TILES) {
    throw new Error(
      `Область точки слишком большая: ${tiles.length} тайлов. Максимум — ${MAX_TILES}.`
    );
  }

  const session = await openDownloadSession(
    options.authToken,
    options.pointId,
    options.bounds,
    options.minZoom,
    options.maxZoom
  );
  const cache = await caches.open(YANDEX_OFFLINE_TILE_CACHE);
  const controller = new AbortController();
  const fetchTile = createOfflineTileFetcher();
  let cursor = 0;
  let completed = 0;
  let byteSize = 0;
  let oldestSavedAt = Date.now();

  const report = (status: OfflineMapDownloadProgress['status'], error?: string) =>
    dispatchProgress({
      pointId: options.pointId,
      completed,
      total: tiles.length,
      byteSize,
      status,
      error,
    });
  report('downloading');

  const worker = async () => {
    while (cursor < tiles.length) {
      controller.signal.throwIfAborted();
      const tile = tiles[cursor];
      cursor += 1;
      const cacheRequest = new Request(getOfflineTileUrl(tile));
      const cached = await cache.match(cacheRequest);

      if (isFreshCachedTile(cached)) {
        const savedAt = Number(cached.headers.get('X-Offline-Saved-At'));
        oldestSavedAt = Math.min(oldestSavedAt, savedAt);
        byteSize += Number(cached.headers.get('Content-Length') || 0);
        completed += 1;
        report('downloading');
        continue;
      }

      if (cached) await cache.delete(cacheRequest);

      const query = new URLSearchParams({
        x: String(tile.x),
        y: String(tile.y),
        z: String(tile.z),
        session,
      });
      const response = await fetchTile(`/api/offline-map/yandex-tile?${query}`, controller.signal);

      if (!response.ok) {
        const payload = (await response.json().catch(() => ({}))) as { error?: string };
        throw new Error(
          payload.error || `Не удалось загрузить тайл ${tile.z}/${tile.x}/${tile.y}.`
        );
      }

      const blob = await response.blob();
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

  const workers = Array.from({ length: DOWNLOAD_WORKERS }, () => worker());
  try {
    await Promise.all(workers);
  } catch (error) {
    controller.abort();
    await Promise.allSettled(workers);
    report('error', error instanceof Error ? error.message : 'Не удалось сохранить карту.');
    throw error;
  }

  const metadata: OfflineMapMetadata = {
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
}

async function syncOnce(input: SyncInput): Promise<OfflineMapMetadata | null> {
  if (typeof window === 'undefined' || !('caches' in window) || navigator.onLine === false) {
    return null;
  }

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
  const pointId = options.pointId === null ? '' : String(options.pointId);
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
