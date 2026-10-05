import { OFFLINE_MAP_RUNTIME_URL } from './offlineMapRuntime';

export const OFFLINE_APP_CACHE_NAME = 'jaco-offline-app-v2';
const IS_DEVELOPMENT = process.env.NODE_ENV === 'development';
const OFFLINE_APP_ROUTES = IS_DEVELOPMENT
  ? []
  : ['/list_orders', '/map_orders', '/price', '/graph', '/statistics', '/settings', '/feedback'];
let ensurePromise: Promise<void> | null = null;

export const OFFLINE_MAP_ASSET_PATHS = [
  OFFLINE_MAP_RUNTIME_URL,
  '/offline-map/yandex-logo-ru.svg',
  '/offline-map/runtime/maplibre-gl.mjs?v=6.12.0',
  '/offline-map/runtime/maplibre-gl-shared.mjs?v=6.12.0',
  '/offline-map/runtime/maplibre-gl-worker.mjs?v=6.12.0',
  '/offline-map/runtime/maplibre-gl.css?v=6.12.0',
];

function getAssetRequest(path: string): Request {
  return new Request(new URL(path, window.location.origin).href);
}

export async function hasOfflineMapAssets(): Promise<boolean> {
  if (typeof window === 'undefined' || !('caches' in window)) {
    return false;
  }

  const cache = await caches.open(OFFLINE_APP_CACHE_NAME);
  const responses = await Promise.all(
    [...OFFLINE_MAP_ASSET_PATHS, ...OFFLINE_APP_ROUTES].map((path) =>
      cache.match(getAssetRequest(path), { ignoreVary: true })
    )
  );

  return responses.every(Boolean);
}

async function cacheOfflineAppAssets(): Promise<void> {
  if (typeof window === 'undefined' || !('caches' in window)) {
    throw new Error('Браузер не поддерживает локальное хранение карты.');
  }

  const cache = await caches.open(OFFLINE_APP_CACHE_NAME);

  for (const path of OFFLINE_MAP_ASSET_PATHS) {
    const request = getAssetRequest(path);
    const cached = await cache.match(request, { ignoreVary: true });

    if (cached) {
      continue;
    }

    const response = await fetch(request, { cache: 'no-store' });

    if (!response.ok) {
      throw new Error(`Не удалось сохранить ${path}`);
    }

    await cache.put(request, response);
  }

  for (const route of OFFLINE_APP_ROUTES) {
    const routeRequest = getAssetRequest(route);
    const routeResponse = await fetch(routeRequest, { cache: 'no-store' });

    if (!routeResponse.ok) {
      throw new Error(`Не удалось сохранить страницу ${route}.`);
    }

    await cache.put(routeRequest, routeResponse.clone());
    const html = await routeResponse.text();
    const linkedAssets = [...html.matchAll(/(?:src|href)=["']([^"']+)["']/g)]
      .map((match) => new URL(match[1], window.location.origin))
      .filter(
        (url) =>
          url.origin === window.location.origin &&
          (url.pathname.startsWith('/_next/static/') || /\.(?:css|woff2?)$/i.test(url.pathname))
      );

    await Promise.allSettled(
      linkedAssets.map(async (url) => {
        const request = new Request(url.href);
        const response = await fetch(request, { cache: 'no-store' });
        if (response.ok) await cache.put(request, response);
      })
    );
  }

  void navigator.storage?.persist?.().catch(() => false);
}

export function ensureOfflineMapAssets(): Promise<void> {
  if (!ensurePromise) {
    ensurePromise = hasOfflineMapAssets()
      .then((isReady) => (isReady ? undefined : cacheOfflineAppAssets()))
      .catch((error) => {
        ensurePromise = null;
        throw error;
      });
  }

  return ensurePromise;
}
