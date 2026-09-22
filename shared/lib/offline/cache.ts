import type { HomeLocation, Order, OrderType } from '@/entities/order/model/order.types';
import type { Point } from '@/entities/point';
import type { SettingsResponse } from '@/entities/settings/model/types';

export const OFFLINE_CACHE_KEY = 'jaco_driver_offline_cache';
export const OFFLINE_CACHE_VERSION = 1;

export interface OfflinePhones {
  phone_upr?: string | null;
  phone_man?: string | null;
  phone_center?: string | null;
}

export interface OfflineOrdersSnapshot {
  orders: Order[];
  sourceOrders: Order[];
  type: OrderType;
  type_dop: string[];
  update_interval: number;
  limit: string;
  limit_count: string;
  home: HomeLocation | null;
  driver_pay: boolean;
  driver_need_gps: boolean;
}

export interface OfflineSettingsSnapshot {
  settings: SettingsResponse | null;
  pointId: number | null;
  points: Point[];
  cityId: string;
}

export interface OfflineCache {
  version: number;
  updatedAt: number;
  orders: OfflineOrdersSnapshot | null;
  settings: OfflineSettingsSnapshot | null;
  phones: OfflinePhones | null;
}

function emptyCache(): OfflineCache {
  return {
    version: OFFLINE_CACHE_VERSION,
    updatedAt: 0,
    orders: null,
    settings: null,
    phones: null,
  };
}

export function readOfflineCache(): OfflineCache | null {
  if (typeof window === 'undefined') {
    return null;
  }

  try {
    const raw = window.localStorage.getItem(OFFLINE_CACHE_KEY);

    if (!raw) {
      return null;
    }

    const parsed = JSON.parse(raw) as OfflineCache;

    if (!parsed || parsed.version !== OFFLINE_CACHE_VERSION) {
      return null;
    }

    return parsed;
  } catch {
    return null;
  }
}

export function writeOfflineCache(
  patch: Partial<Pick<OfflineCache, 'orders' | 'settings' | 'phones'>>
): void {
  if (typeof window === 'undefined') {
    return;
  }

  try {
    const current = readOfflineCache() ?? emptyCache();
    const next: OfflineCache = {
      version: OFFLINE_CACHE_VERSION,
      updatedAt: Date.now(),
      orders: patch.orders !== undefined ? patch.orders : current.orders,
      settings: patch.settings !== undefined ? patch.settings : current.settings,
      phones: patch.phones !== undefined ? patch.phones : current.phones,
    };

    window.localStorage.setItem(OFFLINE_CACHE_KEY, JSON.stringify(next));
  } catch {
    // Quota or private mode — ignore, online mode still works.
  }
}

export function clearOfflineCache(): void {
  if (typeof window === 'undefined') {
    return;
  }

  try {
    window.localStorage.removeItem(OFFLINE_CACHE_KEY);
  } catch {
    // ignore
  }
}
