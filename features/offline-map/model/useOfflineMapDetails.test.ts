import { act, cleanup, renderHook } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { useOfflineMapDetails } from './useOfflineMapDetails';

const mocks = vi.hoisted(() => ({
  sync: vi.fn().mockResolvedValue(undefined),
  online: true,
  auth: true,
  busy: null as string | null,
}));
vi.mock('@/shared/lib/offline/yandexOfflineMap', () => ({
  scheduleOfflineMapDetailSync: mocks.sync,
  YANDEX_OFFLINE_MAP_EVENT: 'map-progress',
}));
vi.mock('@/shared/api/token', () => ({ getAuthToken: () => 'token' }));
vi.mock('@/shared/lib/devLog', () => ({ devLog: vi.fn() }));
vi.mock('@/features/auth/model/auth.store', () => ({
  useAuthStore: (select: (state: unknown) => unknown) =>
    select({ session: { isAuth: mocks.auth } }),
}));
vi.mock('@/features/offline/model/connectivity.store', () => ({
  useConnectivityStore: (select: (state: unknown) => unknown) => select({ isOnline: mocks.online }),
  isAppOnline: () => mocks.online,
}));
vi.mock('@/entities/offline-map/model/offlineMap.store', () => ({
  useOfflineMapStore: (select: (state: unknown) => unknown) => select({ busyCityId: mocks.busy }),
}));

describe('viewed offline detail', () => {
  const coordinates = [[53.52, 49.42]];
  let change: () => void;
  const map = {
    getBounds: () => [
      [53.51, 49.41],
      [53.53, 49.43],
    ],
    getZoom: () => 18,
    events: {
      add: vi.fn((_event, callback) => {
        change = callback;
      }),
      remove: vi.fn(),
    },
  };
  beforeEach(() => {
    vi.clearAllMocks();
    vi.useFakeTimers();
    mocks.online = true;
    mocks.auth = true;
    mocks.busy = null;
  });
  afterEach(() => {
    cleanup();
    vi.useRealTimers();
  });

  it('debounces movement and sends markers with the current viewport', () => {
    renderHook(() => useOfflineMapDetails(map, coordinates));
    act(() => {
      vi.advanceTimersByTime(500);
      change();
      vi.advanceTimersByTime(749);
    });
    expect(mocks.sync).not.toHaveBeenCalled();
    act(() => vi.advanceTimersByTime(1));
    expect(mocks.sync).toHaveBeenCalledWith({
      authToken: 'token',
      coordinates,
      zoom: 18,
      viewport: { south: 53.51, west: 49.41, north: 53.53, east: 49.43 },
    });
  });

  it('retries after a completed base download, not after every detailed tile', () => {
    renderHook(() => useOfflineMapDetails(map, coordinates));
    act(() => vi.advanceTimersByTime(750));
    mocks.sync.mockClear();
    act(() => {
      window.dispatchEvent(
        new CustomEvent('map-progress', { detail: { status: 'ready', pointId: 'city:samara' } })
      );
      vi.advanceTimersByTime(750);
    });
    expect(mocks.sync).toHaveBeenCalledOnce();
    mocks.sync.mockClear();
    act(() => {
      window.dispatchEvent(
        new CustomEvent('map-progress', { detail: { status: 'ready', pointId: 'detail:16/1/1' } })
      );
      vi.advanceTimersByTime(750);
    });
    expect(mocks.sync).not.toHaveBeenCalled();
  });

  it('does not schedule downloads offline, logged out or during a city download', () => {
    mocks.online = false;
    const { rerender } = renderHook(() => useOfflineMapDetails(map, coordinates));
    act(() => vi.advanceTimersByTime(1000));
    mocks.online = true;
    mocks.auth = false;
    rerender();
    act(() => vi.advanceTimersByTime(1000));
    mocks.auth = true;
    mocks.busy = 'samara';
    rerender();
    act(() => vi.advanceTimersByTime(1000));
    expect(mocks.sync).not.toHaveBeenCalled();
  });

  it('clears listeners and pending movement on unmount', () => {
    const { unmount } = renderHook(() => useOfflineMapDetails(map, coordinates));
    unmount();
    act(() => vi.advanceTimersByTime(1000));
    expect(mocks.sync).not.toHaveBeenCalled();
    expect(map.events.remove).toHaveBeenCalledWith('boundschange', expect.any(Function));
  });
});
