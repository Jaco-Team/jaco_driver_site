import { describe, expect, it } from 'vitest';
import {
  getMarkerOfflineDetailPlans,
  getViewedOfflineDetailPlans,
  getOfflineDetailPlan,
} from './offlineMapDetails';
import { getOfflineCityPlan, listOfflineMapTiles } from './yandexOfflineMap';

describe('offline detail planning', () => {
  it.each([
    ['samara', 8295],
    ['tolyatti', 4697],
  ])('includes layer 15 in %s', (city, count) => {
    const plan = getOfflineCityPlan(String(city));
    expect(plan.maxZoom).toBe(15);
    expect(plan.tileCount).toBe(count);
  });

  it('deduplicates markers in one cell and saves only 85 detailed tiles', () => {
    const plans = getMarkerOfflineDetailPlans([
      [53.52, 49.42],
      [53.52, 49.42],
      [NaN, 0],
      [55.7, 37.6],
    ]);
    expect(plans).toHaveLength(1);
    expect(plans[0]).toMatchObject({ minZoom: 16, maxZoom: 19, parentCityId: 'tolyatti' });
    expect(listOfflineMapTiles(plans[0].bounds, 16, 19)).toHaveLength(85);
  });

  it('does not download detail when looking at the city from afar', () => {
    expect(getViewedOfflineDetailPlans(getOfflineCityPlan('samara').bounds, 15)).toEqual([]);
  });

  it('saves viewed cells only to the zoom actually opened', () => {
    const { bounds } = getMarkerOfflineDetailPlans([[53.52, 49.42]])[0];
    const plans = getViewedOfflineDetailPlans(bounds, 17.8);
    expect(plans).toHaveLength(1);
    expect(plans[0].maxZoom).toBe(17);
    expect(listOfflineMapTiles(plans[0].bounds, 16, 17)).toHaveLength(5);
    expect(getViewedOfflineDetailPlans(bounds, 30)[0].maxZoom).toBe(19);
  });

  it('bounds work and rejects malformed inputs and cells outside supported cities', () => {
    expect(
      getViewedOfflineDetailPlans(getOfflineCityPlan('samara').bounds, 19).length
    ).toBeLessThanOrEqual(32);
    expect(getViewedOfflineDetailPlans({ west: 0, east: 1, south: NaN, north: 1 }, 19)).toEqual([]);
    expect(getOfflineDetailPlan({ x: 0, y: 0, maxZoom: 19 })).toBeNull();
  });
});
