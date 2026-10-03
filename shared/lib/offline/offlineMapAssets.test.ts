import { afterEach, describe, expect, it, vi } from 'vitest';

import {
  OFFLINE_APP_CACHE_NAME,
  OFFLINE_MAP_ASSET_PATHS,
  hasOfflineMapAssets,
} from './offlineMapAssets';

describe('offline application assets', () => {
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
});
