import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import {
  OFFLINE_APP_CACHE_NAME,
  OFFLINE_MAP_ASSET_PATHS,
  hasOfflineMapAssets,
  ensureOfflineMapAssets,
} from './offlineMapAssets';

describe('offline application assets', () => {
  beforeEach(() => {
    vi.stubGlobal('navigator', {
      serviceWorker: { controller: { scriptURL: 'https://localhost/sw.js' } },
    });
  });
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('checks the map runtime and every offline page shell in one cache', async () => {
    const matchedUrls: string[] = [];
    const match = vi.fn(async (request: Request) => {
      matchedUrls.push(request.url);
      return new Response('cached');
    });
    const open = vi.fn(async () => ({ match }));
    vi.stubGlobal('caches', { open });

    await expect(hasOfflineMapAssets()).resolves.toBe(true);
    expect(open).toHaveBeenCalledWith(OFFLINE_APP_CACHE_NAME);
    for (const [request] of match.mock.calls) {
      expect(match).toHaveBeenCalledWith(request, { ignoreVary: true });
    }

    for (const path of OFFLINE_MAP_ASSET_PATHS) {
      expect(matchedUrls).toContain(new URL(path, window.location.origin).href);
    }
    for (const route of [
      '/list_orders',
      '/map_orders',
      '/price',
      '/graph',
      '/statistics',
      '/settings',
      '/feedback',
    ]) {
      expect(matchedUrls).toContain(new URL(route, window.location.origin).href);
    }
  });

  it('reports an incomplete cache when any required entry is absent', async () => {
    let calls = 0;
    const match = vi.fn(async () => {
      calls += 1;
      return calls === 1 ? undefined : new Response('cached');
    });
    vi.stubGlobal('caches', { open: vi.fn(async () => ({ match })) });

    await expect(hasOfflineMapAssets()).resolves.toBe(false);
  });

  it('does not treat cached page HTML as sufficient when its script was evicted', async () => {
    const match = vi.fn(async (request: Request) => {
      if (request.url.endsWith('/_next/static/missing.js')) return undefined;
      if (request.url.endsWith('/map_orders'))
        return new Response('<script src="/_next/static/missing.js"></script>');
      return new Response('cached');
    });
    vi.stubGlobal('caches', { open: vi.fn(async () => ({ match })) });
    try {
      await expect(hasOfflineMapAssets()).resolves.toBe(false);
    } finally {
      vi.unstubAllGlobals();
    }
  });

  it('fails preparation on a missing page script and allows a later retry', async () => {
    const entries = new Map<string, Response>();
    const cache = {
      match: vi.fn(async (request: Request) => entries.get(request.url)?.clone()),
      put: vi.fn(async (request: Request, response: Response) => {
        entries.set(request.url, response.clone());
      }),
    };
    vi.stubGlobal('caches', { open: vi.fn(async () => cache) });
    let missing = true;
    vi.stubGlobal(
      'fetch',
      vi.fn(async (request: Request) => {
        const path = new URL(request.url).pathname;
        if (path === '/_next/static/required.js')
          return new Response('script', { status: missing ? 404 : 200 });
        if (path === '/map_orders')
          return new Response('<script src="/_next/static/required.js"></script>');
        return new Response('asset');
      })
    );
    try {
      await expect(ensureOfflineMapAssets()).rejects.toThrow(/Не удалось сохранить файлы/);
      await expect(hasOfflineMapAssets()).resolves.toBe(false);
      missing = false;
      await ensureOfflineMapAssets();
      await expect(hasOfflineMapAssets()).resolves.toBe(true);
      entries.delete(new URL('/_next/static/required.js', location.origin).href);
      await ensureOfflineMapAssets();
      await expect(hasOfflineMapAssets()).resolves.toBe(true);
    } finally {
      vi.unstubAllGlobals();
    }
  });

  it('does not claim cold offline readiness before a service worker controls the page', async () => {
    vi.stubGlobal('navigator', { serviceWorker: { controller: null } });
    const open = vi.fn();
    vi.stubGlobal('caches', { open });
    await expect(hasOfflineMapAssets()).resolves.toBe(false);
    expect(open).not.toHaveBeenCalled();
  });
  it('does not mistake a different worker for the offline site worker', async () => {
    vi.stubGlobal('navigator', {
      serviceWorker: { controller: { scriptURL: 'https://localhost/firebase-messaging-sw.js' } },
    });
    vi.stubGlobal('caches', { open: vi.fn() });
    await expect(hasOfflineMapAssets()).resolves.toBe(false);
  });
});
