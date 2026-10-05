import { describe, expect, it } from 'vitest';
import { getOfflineMapRegionId } from './offlineMapRegionId';

describe('offline map region identity', () => {
  it('keeps the selected cafe identifier', () => {
    expect(getOfflineMapRegionId(12, null)).toBe('12');
  });

  it('uses the cafe coordinates when no filter is selected', () => {
    const home = { center: [53.51, 49.42] as [number, number], zoom: 12, controls: [] };
    expect(getOfflineMapRegionId(null, home)).toBe('home:53.510000:49.420000');
    expect(getOfflineMapRegionId(null, { ...home, center: [53.2, 50.1] })).not.toBe(
      getOfflineMapRegionId(null, home)
    );
  });

  it('does not create a region without valid cafe coordinates', () => {
    expect(getOfflineMapRegionId(null, null)).toBeNull();
    expect(getOfflineMapRegionId(null, { center: [NaN, 49.4], zoom: 12, controls: [] })).toBeNull();
    expect(getOfflineMapRegionId(null, { center: [91, 49.4], zoom: 12, controls: [] })).toBeNull();
  });
});
