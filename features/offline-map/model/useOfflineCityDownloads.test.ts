import { act, renderHook } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { useOfflineCityDownloads } from './useOfflineCityDownloads';

const mocks = vi.hoisted(() => ({
  state: {
    busyCityId: null as string | null,
    hydrate: vi.fn(),
    applyProgress: vi.fn(),
    pauseAll: vi.fn(),
    resumePending: vi.fn(),
  },
  auth: { session: { isAuth: true as boolean | string } },
  connection: { isOnline: true },
}));
vi.mock('@/entities/offline-map/model/offlineMap.store', () => ({
  useOfflineMapStore: Object.assign(
    (select: (state: typeof mocks.state) => unknown) => select(mocks.state),
    { getState: () => mocks.state }
  ),
}));
vi.mock('@/features/auth/model/auth.store', () => ({
  useAuthStore: Object.assign(
    (select: (state: typeof mocks.auth) => unknown) => select(mocks.auth),
    { getState: () => mocks.auth }
  ),
}));
vi.mock('@/features/offline/model/connectivity.store', () => ({
  useConnectivityStore: Object.assign(
    (select: (state: typeof mocks.connection) => unknown) => select(mocks.connection),
    { getState: () => mocks.connection }
  ),
}));
vi.mock('@/shared/lib/offline/yandexOfflineMap', () => ({
  YANDEX_OFFLINE_MAP_EVENT: 'city-progress',
}));

describe('city download lifecycle', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.auth.session.isAuth = true;
    mocks.connection.isOnline = true;
    mocks.state.busyCityId = null;
  });

  it('hydrates and resumes authenticated downloads', () => {
    renderHook(useOfflineCityDownloads);
    expect(mocks.state.hydrate).toHaveBeenCalledOnce();
    expect(mocks.state.resumePending).toHaveBeenCalledOnce();
  });

  it('pauses on disconnect and resumes after reconnect', () => {
    const { rerender } = renderHook(useOfflineCityDownloads);
    mocks.connection.isOnline = false;
    rerender();
    expect(mocks.state.pauseAll).toHaveBeenCalledWith(true);
    mocks.connection.isOnline = true;
    rerender();
    expect(mocks.state.resumePending).toHaveBeenCalledTimes(2);
  });

  it('disables automatic resume on logout', () => {
    mocks.auth.session.isAuth = false;
    renderHook(useOfflineCityDownloads);
    expect(mocks.state.pauseAll).toHaveBeenCalledWith(false);
    expect(mocks.state.resumePending).not.toHaveBeenCalled();
  });

  it('does not restart a download while leaving the document', () => {
    const { rerender } = renderHook(useOfflineCityDownloads);
    mocks.state.resumePending.mockClear();
    act(() => {
      window.dispatchEvent(new Event('pagehide'));
    });
    mocks.state.busyCityId = 'samara';
    rerender();
    expect(mocks.state.pauseAll).toHaveBeenCalledWith(true);
    expect(mocks.state.resumePending).not.toHaveBeenCalled();
    act(() => {
      window.dispatchEvent(new Event('pageshow'));
    });
    expect(mocks.state.resumePending).toHaveBeenCalledOnce();
  });
});
