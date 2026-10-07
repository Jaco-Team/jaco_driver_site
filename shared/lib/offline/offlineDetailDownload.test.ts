import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { getMarkerOfflineDetailPlans, OFFLINE_DETAIL_MAX_BYTES } from './offlineMapDetails';
import {
  scheduleOfflineMapDetailSync,
  cancelOfflineMapDetailDownloads,
  getOfflineCityPlan,
  readOfflineMapMetadata,
  readOfflineMapRegistry,
  deleteOfflineYandexMap,
  YANDEX_OFFLINE_METADATA_KEY,
  listOfflineMapTiles,
  getOfflineTileUrl,
} from './yandexOfflineMap';

const mocks = vi.hoisted(() => ({ fetchTile: vi.fn() }));
vi.mock('./offlineMapAssets', () => ({
  ensureOfflineMapAssets: vi.fn().mockResolvedValue(undefined),
}));
vi.mock('./offlineTileFetcher', () => ({ createOfflineTileFetcher: () => mocks.fetchTile }));

describe('offline detail downloads', () => {
  const coordinates = [[53.52, 49.42]];
  const plan = getMarkerOfflineDetailPlans(coordinates)[0];
  let entries: Map<string, Response>;
  let cache: {
    match: ReturnType<typeof vi.fn>;
    put: ReturnType<typeof vi.fn>;
    keys: ReturnType<typeof vi.fn>;
    delete: ReturnType<typeof vi.fn>;
  };

  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
    entries = new Map();
    cache = {
      match: vi.fn(async (request: Request) => entries.get(request.url)?.clone()),
      put: vi.fn(async (request: Request, response: Response) => {
        entries.set(request.url, response.clone());
      }),
      keys: vi.fn(async () => [...entries.keys()].map((url) => new Request(url))),
      delete: vi.fn(async (request: Request) => entries.delete(request.url)),
    };
    vi.stubGlobal('caches', { open: vi.fn(async () => cache) });
    vi.stubGlobal(
      'fetch',
      vi.fn(async () => Response.json({ session: 'session' }))
    );
    mocks.fetchTile.mockImplementation(
      async () => new Response('png', { headers: { 'Content-Type': 'image/png' } })
    );
    localStorage.setItem(
      YANDEX_OFFLINE_METADATA_KEY,
      JSON.stringify({
        version: 2,
        regions: {
          'city:tolyatti': {
            ...getOfflineCityPlan('tolyatti'),
            savedAt: Date.now(),
            expiresAt: Date.now() + 2 * 86400000,
            lastUsedAt: Date.now(),
            byteSize: 1000,
          },
        },
      })
    );
  });
  afterEach(async () => {
    cancelOfflineMapDetailDownloads();
    await deleteOfflineYandexMap('test-cleanup');
    vi.unstubAllGlobals();
  });

  it('deduplicates parallel requests and skips already completed cells', async () => {
    await Promise.all([
      scheduleOfflineMapDetailSync({ authToken: 'token', coordinates }),
      scheduleOfflineMapDetailSync({ authToken: 'token', coordinates }),
    ]);
    expect(mocks.fetchTile).toHaveBeenCalledTimes(85);
    expect(readOfflineMapMetadata(plan.pointId)).toMatchObject({ kind: 'detail', maxZoom: 19 });
    await scheduleOfflineMapDetailSync({ authToken: 'token', coordinates });
    expect(mocks.fetchTile).toHaveBeenCalledTimes(85);
    expect(fetch).toHaveBeenCalledTimes(1);
    expect(JSON.parse(vi.mocked(fetch).mock.calls[0][1]!.body as string).detailTile).toEqual(
      plan.detailTile
    );
  });

  it('upgrades a viewed cell without downloading its lower levels again', async () => {
    await scheduleOfflineMapDetailSync({ authToken: 'token', viewport: plan.bounds, zoom: 17 });
    expect(mocks.fetchTile).toHaveBeenCalledTimes(5);
    await scheduleOfflineMapDetailSync({ authToken: 'token', coordinates });
    expect(mocks.fetchTile).toHaveBeenCalledTimes(85);
    expect(readOfflineMapMetadata(plan.pointId)?.maxZoom).toBe(19);
  });

  it('repairs a browser-evicted detail tile', async () => {
    await scheduleOfflineMapDetailSync({ authToken: 'token', coordinates });
    entries.delete(getOfflineTileUrl(listOfflineMapTiles(plan.bounds, 16, 19)[0]));
    await scheduleOfflineMapDetailSync({ authToken: 'token', coordinates });
    expect(mocks.fetchTile).toHaveBeenCalledTimes(86);
  });

  it('does not immediately re-download a cell evicted by the cache size limit', async () => {
    await scheduleOfflineMapDetailSync({ authToken: 'token', coordinates });
    const registry = readOfflineMapRegistry();
    delete registry.regions[plan.pointId];
    localStorage.setItem(YANDEX_OFFLINE_METADATA_KEY, JSON.stringify(registry));
    await scheduleOfflineMapDetailSync({ authToken: 'token', coordinates });
    expect(fetch).toHaveBeenCalledTimes(1);
  });

  it('aborts active detail downloads without replacing the complete base map', async () => {
    mocks.fetchTile.mockImplementation(async () => {
      cancelOfflineMapDetailDownloads();
      return new Response('png');
    });
    await scheduleOfflineMapDetailSync({ authToken: 'token', coordinates });
    expect(readOfflineMapMetadata(plan.pointId)).toBeNull();
    expect(readOfflineMapMetadata('city:tolyatti')).not.toBeNull();
    expect(cache.put).not.toHaveBeenCalled();
  });

  it('does not download without authorization, a base map or a connection', async () => {
    await scheduleOfflineMapDetailSync({ authToken: '', coordinates });
    localStorage.clear();
    await scheduleOfflineMapDetailSync({ authToken: 'token', coordinates });
    expect(fetch).not.toHaveBeenCalled();
  });

  it('does not use a legacy point area as the base for detail downloads', async () => {
    const legacy = readOfflineMapMetadata('city:tolyatti')!;
    localStorage.setItem(
      YANDEX_OFFLINE_METADATA_KEY,
      JSON.stringify({
        version: 2,
        regions: { '12': { ...legacy, pointId: '12', cityId: undefined } },
      })
    );

    await scheduleOfflineMapDetailSync({ authToken: 'token', coordinates });

    expect(fetch).not.toHaveBeenCalled();
    expect(mocks.fetchTile).not.toHaveBeenCalled();
  });

  it('caps detail storage separately without evicting the base city', async () => {
    const registry = readOfflineMapRegistry();
    for (let index = 0; index < 3; index++)
      registry.regions[`old-${index}`] = {
        ...plan,
        pointId: `old-${index}`,
        coverageVersion: 2,
        tileCount: 85,
        savedAt: Date.now(),
        expiresAt: Date.now() + 86400000,
        lastUsedAt: Date.now() - 1000 - index,
        byteSize: OFFLINE_DETAIL_MAX_BYTES / 2,
      };
    localStorage.setItem(YANDEX_OFFLINE_METADATA_KEY, JSON.stringify(registry));
    await scheduleOfflineMapDetailSync({ authToken: 'token', coordinates });
    const maps = Object.values(readOfflineMapRegistry().regions);
    expect(
      maps.filter((map) => map.kind === 'detail').reduce((sum, map) => sum + map.byteSize, 0)
    ).toBeLessThanOrEqual(OFFLINE_DETAIL_MAX_BYTES);
    expect(readOfflineMapMetadata('city:tolyatti')).not.toBeNull();
  });

  it('removes the associated detailed cells when deleting a city', async () => {
    await scheduleOfflineMapDetailSync({ authToken: 'token', coordinates });
    await deleteOfflineYandexMap('city:tolyatti');
    expect(readOfflineMapMetadata(plan.pointId)).toBeNull();
    expect(entries.size).toBe(0);
  });
});
