import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import {
  downloadOfflineCityMap,
  getOfflineCityPlan,
  listOfflineMapTiles,
  getOfflineTileUrl,
  readOfflineMapMetadata,
  readPendingCityDownloads,
  deleteOfflineYandexMap,
  YANDEX_OFFLINE_CITY_DOWNLOADS_KEY,
  YANDEX_OFFLINE_METADATA_KEY,
  validateOfflineCityMaps,
} from './yandexOfflineMap';

const mocks = vi.hoisted(() => ({ fetchTile: vi.fn(), prepare: vi.fn() }));
vi.mock('./offlineMapAssets', () => ({
  ensureOfflineMapAssets: mocks.prepare,
}));
vi.mock('./offlineMapRuntime', () => ({ loadOfflineMapRuntime: vi.fn().mockResolvedValue({}) }));
vi.mock('./offlineTileFetcher', () => ({ createOfflineTileFetcher: () => mocks.fetchTile }));

describe('city map download and resume', () => {
  let missingUrl: string;
  let cached: Response;
  let cache: {
    match: ReturnType<typeof vi.fn>;
    put: ReturnType<typeof vi.fn>;
    keys: ReturnType<typeof vi.fn>;
    delete: ReturnType<typeof vi.fn>;
  };
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.prepare.mockResolvedValue(undefined);
    localStorage.clear();
    const plan = getOfflineCityPlan('tolyatti');
    missingUrl = getOfflineTileUrl(listOfflineMapTiles(plan.bounds, plan.minZoom, plan.maxZoom)[0]);
    cached = new Response('png', {
      headers: { 'X-Offline-Saved-At': String(Date.now()), 'Content-Length': '3' },
    });
    cache = {
      match: vi.fn(async (request: Request) => (request.url === missingUrl ? undefined : cached)),
      put: vi.fn(async () => undefined),
      keys: vi.fn(async () => [] as Request[]),
      delete: vi.fn(async () => true),
    };
    vi.stubGlobal('caches', { open: vi.fn(async () => cache) });
    vi.stubGlobal(
      'fetch',
      vi.fn(async () => Response.json({ session: 'signed-session' }))
    );
    mocks.fetchTile.mockResolvedValue(
      new Response('png', { headers: { 'Content-Type': 'image/png' } })
    );
  });
  afterEach(() => vi.unstubAllGlobals());

  it('downloads only missing tiles and publishes readiness only on completion', async () => {
    const result = await downloadOfflineCityMap('tolyatti', 'token', new AbortController().signal);
    expect(result.pointId).toBe('city:tolyatti');
    expect(result.tileCount).toBe(4697);
    expect(result.maxZoom).toBe(15);
    expect(mocks.fetchTile).toHaveBeenCalledTimes(1);
    expect(cache.put).toHaveBeenCalledTimes(1);
    expect(readOfflineMapMetadata('city:tolyatti')).toMatchObject({ cityId: 'tolyatti' });
    expect(readPendingCityDownloads()).toEqual([]);
    const request = JSON.parse(vi.mocked(fetch).mock.calls[0][1]!.body as string);
    expect(request.cityId).toBe('tolyatti');
  });

  it('retains a paused manifest and resumes without reloading fresh tiles', async () => {
    const controller = new AbortController();
    controller.abort();
    await expect(
      downloadOfflineCityMap('tolyatti', 'token', controller.signal)
    ).rejects.toBeDefined();
    expect(readPendingCityDownloads()[0]).toMatchObject({ status: 'paused', autoResume: true });
    expect(readOfflineMapMetadata('city:tolyatti')).toBeNull();
    cache.match.mockResolvedValue(cached);
    await downloadOfflineCityMap('tolyatti', 'token', new AbortController().signal);
    expect(mocks.fetchTile).not.toHaveBeenCalled();
    expect(readPendingCityDownloads()).toEqual([]);
  });

  it('adds only layer 15 to a previously complete layer-14 package', async () => {
    const plan = getOfflineCityPlan('tolyatti');
    const previous = {
      ...plan,
      maxZoom: 14,
      cameraMaxZoom: 13,
      tileCount: 1225,
      coverageVersion: 2,
      savedAt: Date.now(),
      lastUsedAt: Date.now(),
      expiresAt: Date.now() + 86400000,
      byteSize: 3675,
    };
    localStorage.setItem(
      YANDEX_OFFLINE_METADATA_KEY,
      JSON.stringify({ version: 2, regions: { [plan.pointId]: previous } })
    );
    cache.match.mockImplementation(async (request: Request) =>
      request.url.includes('/yandex/15/') ? undefined : cached
    );
    mocks.fetchTile.mockImplementation(async () => new Response('png'));
    const result = await downloadOfflineCityMap('tolyatti', 'token', new AbortController().signal);
    expect(result.maxZoom).toBe(15);
    expect(mocks.fetchTile).toHaveBeenCalledTimes(4697 - 1225);
    expect(
      mocks.fetchTile.mock.calls.every(
        ([url]) => new URL(url, location.origin).searchParams.get('z') === '15'
      )
    ).toBe(true);
  });

  it('does not reset visible progress while rechecking cached tiles on resume', async () => {
    localStorage.setItem(
      YANDEX_OFFLINE_CITY_DOWNLOADS_KEY,
      JSON.stringify([
        {
          cityId: 'tolyatti',
          pointId: 'city:tolyatti',
          updatedAt: Date.now(),
          status: 'paused',
          completed: 500,
          total: 1225,
          byteSize: 1500,
        },
      ])
    );
    cache.match.mockResolvedValue(cached);
    const observed: number[] = [];
    const onProgress = (event: Event) => {
      const progress = (event as CustomEvent).detail;
      if (progress.status === 'downloading') observed.push(progress.completed);
    };
    window.addEventListener('jaco-offline-map-updated', onProgress);
    try {
      await downloadOfflineCityMap('tolyatti', 'token', new AbortController().signal);
      expect(observed.length).toBeGreaterThan(0);
      expect(observed.every((count) => count >= 500)).toBe(true);
    } finally {
      window.removeEventListener('jaco-offline-map-updated', onProgress);
    }
  });

  it('does not discard partial city tiles when deleting a different area', async () => {
    localStorage.setItem(
      YANDEX_OFFLINE_CITY_DOWNLOADS_KEY,
      JSON.stringify([
        {
          cityId: 'tolyatti',
          pointId: 'city:tolyatti',
          updatedAt: Date.now(),
          status: 'paused',
          completed: 1,
          total: 1225,
          byteSize: 3,
        },
      ])
    );
    cache.keys.mockResolvedValue([
      new Request(missingUrl),
      new Request('https://unused.test/tile.png'),
    ]);
    await deleteOfflineYandexMap('unused');
    expect(cache.delete).not.toHaveBeenCalledWith(expect.objectContaining({ url: missingUrl }));
    expect(cache.delete).toHaveBeenCalledTimes(1);
  });

  it('withdraws the ready status when browser tile storage has been cleared', async () => {
    cache.match.mockResolvedValue(cached);
    await downloadOfflineCityMap('tolyatti', 'token', new AbortController().signal);
    expect(readOfflineMapMetadata('city:tolyatti')).not.toBeNull();
    await validateOfflineCityMaps();
    expect(readOfflineMapMetadata('city:tolyatti')).toBeNull();
  });

  it('removes a legacy area that was downloaded automatically without a city package', async () => {
    const plan = getOfflineCityPlan('tolyatti');
    const legacy = {
      ...plan,
      pointId: '12',
      cityId: undefined,
      coverageVersion: 2,
      savedAt: Date.now(),
      expiresAt: Date.now() + 86400000,
      lastUsedAt: Date.now(),
      byteSize: 1000,
    };
    localStorage.setItem(
      YANDEX_OFFLINE_METADATA_KEY,
      JSON.stringify({ version: 2, regions: { '12': legacy } })
    );

    await validateOfflineCityMaps();

    expect(readOfflineMapMetadata('12')).toBeNull();
  });

  it('keeps the previous complete map available when an update is paused', async () => {
    cached.headers.set('X-Offline-Saved-At', String(Date.now() - 1000));
    cache.match.mockResolvedValue(cached);
    await downloadOfflineCityMap('tolyatti', 'token', new AbortController().signal);
    const saved = readOfflineMapMetadata('city:tolyatti');
    const controller = new AbortController();
    mocks.fetchTile.mockImplementation(async () => new Response('new png'));
    cache.put.mockImplementation(async () => {
      controller.abort();
    });
    await expect(
      downloadOfflineCityMap('tolyatti', 'token', controller.signal, true)
    ).rejects.toBeDefined();
    expect(readOfflineMapMetadata('city:tolyatti')?.savedAt).toBe(saved?.savedAt);
    expect(cache.delete).not.toHaveBeenCalled();
    expect(readPendingCityDownloads()[0]).toMatchObject({
      status: 'paused',
      refreshAfter: expect.any(Number),
    });
  });

  it('ignores malformed saved progress', () => {
    localStorage.setItem(
      YANDEX_OFFLINE_CITY_DOWNLOADS_KEY,
      JSON.stringify([
        {
          cityId: 'samara',
          pointId: 'city:samara',
          updatedAt: Date.now(),
          status: 'paused',
          completed: -1,
          total: 2153,
          byteSize: 0,
        },
        {
          cityId: 'unknown',
          pointId: 'city:unknown',
          updatedAt: Date.now(),
          status: 'paused',
          completed: 1,
          total: 100,
          byteSize: 10,
        },
      ])
    );
    expect(readPendingCityDownloads()).toEqual([]);
  });

  it('pauses immediately while waiting behind another download', async () => {
    let release!: () => void;
    mocks.prepare.mockImplementationOnce(
      () =>
        new Promise<void>((resolve) => {
          release = resolve;
        })
    );
    const firstController = new AbortController();
    const first = downloadOfflineCityMap('samara', 'token', firstController.signal);
    await vi.waitFor(() => expect(mocks.prepare).toHaveBeenCalledOnce());
    const secondController = new AbortController();
    const second = downloadOfflineCityMap('tolyatti', 'token', secondController.signal);
    secondController.abort();
    await expect(second).rejects.toBeDefined();
    expect(readPendingCityDownloads().find((item) => item.cityId === 'tolyatti')?.status).toBe(
      'paused'
    );
    firstController.abort();
    await expect(first).rejects.toBeDefined();
    release();
  });

  it('shows a Russian message for a network failure and keeps the partial download', async () => {
    mocks.fetchTile.mockRejectedValue(new TypeError('Failed to fetch'));
    await expect(
      downloadOfflineCityMap('tolyatti', 'token', new AbortController().signal)
    ).rejects.toThrow('Проверьте подключение к интернету');
    expect(readPendingCityDownloads()[0]).toMatchObject({
      status: 'error',
      error: expect.stringContaining('Проверьте подключение'),
    });
    expect(readOfflineMapMetadata('city:tolyatti')).toBeNull();
  });
});
