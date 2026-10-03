import { beforeEach, describe, expect, it } from 'vitest';

import {
  YANDEX_OFFLINE_MAP_EVENT,
  YANDEX_OFFLINE_METADATA_KEY,
  buildOfflineMapBounds,
  listOfflineMapTiles,
  readOfflineMapMetadata,
  readOfflineMapRegistry,
} from './yandexOfflineMap';

describe('Yandex offline map metadata and coverage', () => {
  beforeEach(() => {
    window.localStorage.clear();
  });

  it('builds coverage that contains the cafe and every valid order coordinate', () => {
    const bounds = buildOfflineMapBounds({ center: [53.51, 49.42], zoom: 12, controls: [] }, [
      { id: 1, xy: { latitude: 53.45, longitude: 49.31 } },
      { id: 2, xy: { latitude: 53.6, longitude: 49.55 } },
      { id: 3, xy: { latitude: 999, longitude: 999 } },
    ] as any);

    expect(bounds).not.toBeNull();
    expect(bounds?.south).toBeLessThanOrEqual(53.45);
    expect(bounds?.north).toBeGreaterThanOrEqual(53.6);
    expect(bounds?.west).toBeLessThanOrEqual(49.31);
    expect(bounds?.east).toBeGreaterThanOrEqual(49.55);
  });

  it('lists unique tiles only inside the requested zoom range', () => {
    const tiles = listOfflineMapTiles(
      { west: 49.3, south: 53.45, east: 49.55, north: 53.6 },
      10,
      12
    );
    const keys = tiles.map((tile) => `${tile.z}/${tile.x}/${tile.y}`);

    expect(tiles.length).toBeGreaterThan(0);
    expect(new Set(keys).size).toBe(keys.length);
    expect(Math.min(...tiles.map((tile) => tile.z))).toBe(10);
    expect(Math.max(...tiles.map((tile) => tile.z))).toBe(12);
  });

  it('returns metadata only for the requested point and only before expiry', () => {
    const now = Date.now();
    const metadata = {
      pointId: '12',
      coverageVersion: 2,
      bounds: { west: 49.3, south: 53.45, east: 49.55, north: 53.6 },
      minZoom: 10,
      maxZoom: 12,
      initialZoom: 11,
      cameraMinZoom: 10,
      cameraMaxZoom: 13,
      tileCount: 10,
      byteSize: 1000,
      savedAt: now,
      expiresAt: now + 60_000,
      lastUsedAt: now,
    };
    window.localStorage.setItem(
      YANDEX_OFFLINE_METADATA_KEY,
      JSON.stringify({
        version: 2,
        regions: {
          '12': metadata,
          '13': { ...metadata, pointId: '13', expiresAt: now - 1 },
        },
      })
    );

    expect(readOfflineMapMetadata(12)).toMatchObject({ pointId: '12', tileCount: 10 });
    expect(readOfflineMapMetadata(13)).toBeNull();
    expect(readOfflineMapMetadata(99)).toBeNull();
    expect(readOfflineMapRegistry().regions).toHaveProperty('12');
    expect(YANDEX_OFFLINE_MAP_EVENT).toBe('jaco-offline-map-updated');
  });
});
