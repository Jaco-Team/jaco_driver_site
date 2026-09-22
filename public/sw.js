/*
 * Jaco Driver service worker.
 * Keeps the app shell openable without internet. Order, settings and phone data
 * are not stored here: they live in localStorage (shared/lib/offline/cache.ts).
 */

const VERSION = 'v2';
const PAGE_CACHE = `jaco-pages-${VERSION}`;
const ASSET_CACHE = `jaco-assets-${VERSION}`;
const EXPECTED_CACHES = [PAGE_CACHE, ASSET_CACHE];

const OFFLINE_URL = '/offline.html';
const PRECACHE_URLS = [
  OFFLINE_URL,
  '/manifest.webmanifest',
  '/favicon.ico',
  '/icon.svg',
  '/apple-touch-icon.png',
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

function isImmutableAsset(url) {
  return url.pathname.startsWith('/_next/static/') && !url.pathname.includes('/development/');
}

function isPublicAsset(url) {
  return PUBLIC_ASSET_PATTERN.test(url.pathname);
}

// next/image serves optimized files from a query string, without a file extension.
function isOptimizedImage(url) {
  return url.pathname === '/_next/image';
}

async function putInCache(cacheName, request, response) {
  if (!response || !response.ok || response.type === 'opaque') {
    return;
  }

  const cache = await caches.open(cacheName);
  await cache.put(request, response.clone());
}

async function handleNavigation(request) {
  try {
    const response = await fetch(request);
    await putInCache(PAGE_CACHE, request, response);

    return response;
  } catch (error) {
    const cache = await caches.open(PAGE_CACHE);
    const cached =
      (await cache.match(request)) || (await cache.match(request, { ignoreSearch: true }));

    if (cached) {
      return cached;
    }

    const offline = await caches.match(OFFLINE_URL);

    if (offline) {
      return offline;
    }

    throw error;
  }
}

async function handleCacheFirst(request) {
  const cache = await caches.open(ASSET_CACHE);
  const cached = await cache.match(request);

  if (cached) {
    return cached;
  }

  const response = await fetch(request);
  await putInCache(ASSET_CACHE, request, response);

  return response;
}

async function handleStaleWhileRevalidate(request) {
  const cache = await caches.open(ASSET_CACHE);
  const cached = await cache.match(request);

  const revalidate = fetch(request)
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

      await Promise.allSettled(
        PRECACHE_URLS.map((url) => cache.add(new Request(url, { cache: 'reload' })))
      );

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

  if (isImmutableAsset(url)) {
    event.respondWith(handleCacheFirst(request));
    return;
  }

  if (isPublicAsset(url) || isOptimizedImage(url)) {
    event.respondWith(handleStaleWhileRevalidate(request));
  }
});
