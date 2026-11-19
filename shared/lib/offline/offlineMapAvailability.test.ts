import { describe, expect, it } from 'vitest';
import { getOfflineMapAvailability } from './offlineMapAvailability';
import type { OfflineMapMetadata } from './yandexOfflineMap';

const map = { expiresAt: 2000 } as OfflineMapMetadata;
describe('offline city availability', () => {
  it('requires a complete unexpired package and offline shell files', () => {
    expect(getOfflineMapAvailability(map, 1000, true)).toBe('ready');
    expect(getOfflineMapAvailability(map, 1000, false)).toBe('assets_missing');
    expect(getOfflineMapAvailability(map, 1000, null)).toBe('checking');
    expect(getOfflineMapAvailability({ ...map, incomplete: true }, 1000, true)).toBe('incomplete');
    expect(getOfflineMapAvailability(map, 2000, true)).toBe('expired');
    expect(getOfflineMapAvailability(undefined, 1000, true)).toBe('missing');
  });
});
