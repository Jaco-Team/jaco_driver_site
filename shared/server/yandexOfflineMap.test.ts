import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import {
  buildYandexTileUrl,
  createOfflineMapSession,
  hasYandexTilesApiKey,
  isAllowedOfflineTile,
  verifyOfflineMapSession,
} from './yandexOfflineMap';

const bounds = { west: 37.6, south: 55.7, east: 37.61, north: 55.71 };
const key = 'test-yandex-tiles-key-long-enough';

describe('Yandex offline map sessions', () => {
  beforeEach(() => {
    vi.stubEnv('YANDEX_TILES_API_KEY', key);
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-09-29T12:00:00Z'));
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.unstubAllEnvs();
  });

  it('signs a bounded tile area and rejects tiles outside it', () => {
    const session = createOfflineMapSession({ pointId: 42, bounds, minZoom: 10, maxZoom: 11 });
    const payload = verifyOfflineMapSession(session);

    expect(payload?.pointId).toBe('42');
    expect(payload?.ranges).toHaveLength(2);
    const range = payload!.ranges[0];
    expect(isAllowedOfflineTile(payload!, range.minX, range.minY, range.z)).toBe(true);
    expect(isAllowedOfflineTile(payload!, range.minX - 1, range.minY, range.z)).toBe(false);
    expect(isAllowedOfflineTile(payload!, range.minX, range.minY, 9)).toBe(false);
  });

  it('rejects tampered and expired sessions', () => {
    const session = createOfflineMapSession({ pointId: 42, bounds, minZoom: 10, maxZoom: 10 })!;
    expect(verifyOfflineMapSession(`${session}x`)).toBeNull();
    vi.advanceTimersByTime(20 * 60 * 1000 + 1);
    expect(verifyOfflineMapSession(session)).toBeNull();
  });

  it('limits area, zoom and key access', () => {
    expect(createOfflineMapSession({ pointId: 42, bounds, minZoom: 9, maxZoom: 10 })).toBeNull();
    expect(
      createOfflineMapSession({
        pointId: 42,
        bounds: { west: 37, south: 55, east: 38, north: 56 },
        minZoom: 10,
        maxZoom: 15,
      })
    ).toBeNull();
    expect(
      createOfflineMapSession({
        pointId: 42,
        bounds: { ...bounds, west: 200 },
        minZoom: 10,
        maxZoom: 10,
      })
    ).toBeNull();

    vi.stubEnv('YANDEX_TILES_API_KEY', 'short');
    expect(hasYandexTilesApiKey()).toBe(false);
    expect(verifyOfflineMapSession('anything')).toBeNull();
  });

  it('keeps the server key in the upstream tile URL', () => {
    const url = buildYandexTileUrl(1, 2, 10);
    expect(url.origin).toBe('https://tiles.api-maps.yandex.ru');
    expect(url.searchParams.get('apikey')).toBe(key);
    expect(url.searchParams.get('x')).toBe('1');
  });
});
