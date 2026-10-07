/*
 * Jaco Driver service worker.
 * Keeps the app shell openable without internet. Order, settings and phone data
 * are not stored here: they live in localStorage (shared/lib/offline/cache.ts).
 */

const VERSION = 'v45';
const NETWORK_TIMEOUT_MS = 15_000;
const PAGE_CACHE = `jaco-pages-${VERSION}`;
const ASSET_CACHE = `jaco-assets-${VERSION}`;
const OFFLINE_APP_CACHE = 'jaco-offline-app-v2';
const YANDEX_OFFLINE_TILE_CACHE = 'jaco-yandex-offline-tiles-v1';
const EXPECTED_CACHES = [PAGE_CACHE, ASSET_CACHE, OFFLINE_APP_CACHE, YANDEX_OFFLINE_TILE_CACHE];

const OFFLINE_URL = '/offline.html';
const PRECACHE_URLS = [
  OFFLINE_URL,
  '/manifest.webmanifest',
  '/favicon.ico',
  '/icon.svg',
  '/apple-touch-icon.png',
  '/offline-map/runtime/maplibre-gl.mjs?v=6.12.0',
  '/offline-map/runtime/maplibre-gl-shared.mjs?v=6.12.0',
  '/offline-map/runtime/maplibre-gl-worker.mjs?v=6.12.0',
  '/offline-map/runtime/maplibre-gl.css?v=6.12.0',
  '/offline-map/offline-orders-map.mjs?v=30',
  '/offline-map/yandex-logo-ru.svg',
];

const PUBLIC_ASSET_PATTERN = /\.(?:png|jpe?g|webp|gif|svg|ico|webmanifest|css|woff2?)$/i;

function isBypassedRequest(url) {
  return (
    url.pathname.startsWith('/api/') ||
    url.pathname.startsWith('/monitoring') ||
    url.pathname.startsWith('/_next/data/') ||
    url.pathname.startsWith('/_next/webpack-hmr') ||
    url.pathname.startsWith('/__nextjs') ||
    url.pathname.includes('.hot-update.')
  );
}

function isNextStaticAsset(url) {
  return url.pathname.startsWith('/_next/static/');
}

function isPublicAsset(url) {
  return PUBLIC_ASSET_PATTERN.test(url.pathname);
}

// next/image serves optimized files from a query string, without a file extension.
function isOptimizedImage(url) {
  return url.pathname === '/_next/image';
}

function isOfflineMapAsset(url) {
  return url.pathname.startsWith('/offline-map/');
}

async function putInCache(cacheName, request, response) {
  if (!response || !response.ok || response.type === 'opaque') {
    return;
  }

  try {
    const cache = await caches.open(cacheName);
    await cache.put(request, response.clone());
  } catch {
    // A full or unavailable cache must not discard a successful network response.
  }
}

async function matchCache(request, options) {
  try {
    return await caches.match(request, options);
  } catch {
    return undefined;
  }
}

async function fetchWithTimeout(request) {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), NETWORK_TIMEOUT_MS);

  try {
    return await fetch(request, { signal: controller.signal });
  } finally {
    clearTimeout(timeoutId);
  }
}

async function handleNavigation(request) {
  try {
    const response = await fetchWithTimeout(request);
    await putInCache(PAGE_CACHE, request, response);

    return response;
  } catch (error) {
    const cached =
      (await matchCache(request, { cacheName: PAGE_CACHE, ignoreVary: true })) ||
      (await matchCache(request, {
        cacheName: PAGE_CACHE,
        ignoreSearch: true,
        ignoreVary: true,
      })) ||
      (await matchCache(request, {
        cacheName: OFFLINE_APP_CACHE,
        ignoreSearch: true,
        ignoreVary: true,
      }));

    if (cached) {
      return cached;
    }

    const offline = await matchCache(OFFLINE_URL);

    if (offline) {
      return offline;
    }

    throw error;
  }
}

async function handleOfflineMapAsset(request) {
  // Cache Storage contains decoded static files, independent of Accept-Encoding.
  // Keep query strings intact: they identify the runtime version.
  const cached = await matchCache(request, { ignoreVary: true });

  if (cached) {
    return cached;
  }

  const response = await fetchWithTimeout(request);
  await putInCache(OFFLINE_APP_CACHE, request, response);

  return response;
}

async function handleNextStaticAsset(request) {
  const cached =
    (await matchCache(request, { cacheName: ASSET_CACHE, ignoreVary: true })) ||
    (await matchCache(request, { cacheName: OFFLINE_APP_CACHE, ignoreVary: true }));

  // Next.js chunk URLs include a build ID or content hash and are immutable.
  if (cached) {
    return cached;
  }

  const response = await fetchWithTimeout(request);
  await putInCache(ASSET_CACHE, request, response);
  return response;
}

async function handleStaleWhileRevalidate(request) {
  const cached = await matchCache(request, { cacheName: ASSET_CACHE, ignoreVary: true });

  const revalidate = fetchWithTimeout(request)
    .then((response) => putInCache(ASSET_CACHE, request, response).then(() => response))
    .catch(() => undefined);

  if (cached) {
    return cached;
  }

  const response = await revalidate;

  if (response) {
    return response;
  }

  throw new Error(`Не удалось загрузить ${request.url}`);
}

self.addEventListener('install', (event) => {
  event.waitUntil(
    (async () => {
      const cache = await caches.open(ASSET_CACHE);

      await cache.addAll(PRECACHE_URLS.map((url) => new Request(url, { cache: 'reload' })));

      await self.skipWaiting();
    })()
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    (async () => {
      const keys = await caches.keys();

      await Promise.all(
        keys
          .filter((key) => key.startsWith('jaco-') && !EXPECTED_CACHES.includes(key))
          .map((key) => caches.delete(key))
      );

      await self.clients.claim();
    })()
  );
});

self.addEventListener('message', (event) => {
  if (event.data === 'SKIP_WAITING') {
    void self.skipWaiting();
  }
});

self.addEventListener('fetch', (event) => {
  const { request } = event;

  if (request.method !== 'GET' || request.headers.has('range')) {
    return;
  }

  const url = new URL(request.url);

  if (url.origin !== self.location.origin || isBypassedRequest(url)) {
    return;
  }

  if (request.mode === 'navigate') {
    event.respondWith(handleNavigation(request));
    return;
  }

  if (isOfflineMapAsset(url)) {
    event.respondWith(handleOfflineMapAsset(request));
    return;
  }

  if (isNextStaticAsset(url)) {
    event.respondWith(handleNextStaticAsset(request));
    return;
  }

  if (isPublicAsset(url) || isOptimizedImage(url)) {
    event.respondWith(handleStaleWhileRevalidate(request));
  }
});
