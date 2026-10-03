import { afterEach, describe, expect, it } from 'vitest';

import { OFFLINE_CACHE_KEY, clearOfflineCache, readOfflineCache, writeOfflineCache } from './cache';

describe('offline cache', () => {
  afterEach(() => {
    window.localStorage.clear();
  });

  it('merges orders, settings and phones without dropping other fields', () => {
    writeOfflineCache({
      orders: {
        orders: [{ id: 1, drink_list: [], pd: '', et: '', kv: '', comment: '' }],
        sourceOrders: [{ id: 1, drink_list: [], pd: '', et: '', kv: '', comment: '' }],
        type: { id: 1, text: 'Активные' },
        type_dop: ['1', '2', '3'],
        update_interval: 30,
        limit: '1',
        limit_count: '2',
        home: null,
        driver_pay: false,
        driver_need_gps: true,
      },
    });

    writeOfflineCache({
      phones: { phone_upr: '79001112233' },
    });

    writeOfflineCache({
      settings: {
        settings: { fontSize: 18, theme: 'white' },
        pointId: 12,
        points: [],
        cityId: '1',
      },
    });

    const cached = readOfflineCache();

    expect(cached?.orders?.orders[0]?.id).toBe(1);
    expect(cached?.phones?.phone_upr).toBe('79001112233');
    expect(cached?.settings?.pointId).toBe(12);
    expect(window.localStorage.getItem(OFFLINE_CACHE_KEY)).toContain('fontSize');
  });

  it('clears the cache', () => {
    writeOfflineCache({ phones: { phone_man: '79001112233' } });
    clearOfflineCache();
    expect(readOfflineCache()).toBeNull();
  });
});
