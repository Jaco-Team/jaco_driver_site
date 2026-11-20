import { act, renderHook, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { useConnectivityWatch } from './useConnectivityWatch';

const mocks = vi.hoisted(() => ({
  isOnline: false,
  startConnectivityWatch: vi.fn(() => vi.fn()),
  refreshSession: vi.fn(),
  getMySetting: vi.fn(),
  getOrders: vi.fn(),
  getStat: vi.fn(),
  hydrateFinishes: vi.fn(),
  flushFinishes: vi.fn(),
}));

// Queue persistence and retries have their own tests; here verify the hook's triggers.
vi.mock('@/entities/order/model/pendingFinishes', () => ({
  pendingFinishes: {
    hydrate: mocks.hydrateFinishes,
    flush: mocks.flushFinishes,
  },
}));

vi.mock('@/features/offline/model/connectivity.store', () => ({
  useConnectivityStore: (
    selector: (state: {
      isOnline: boolean;
      startConnectivityWatch: typeof mocks.startConnectivityWatch;
    }) => unknown
  ) => selector({ isOnline: mocks.isOnline, startConnectivityWatch: mocks.startConnectivityWatch }),
}));

vi.mock('@/features/auth/model/auth.store', () => ({
  useAuthStore: {
    getState: () => ({
      refreshSession: mocks.refreshSession,
      session: { isAuth: true, token: 'token' },
    }),
  },
}));

vi.mock('@/entities/settings', () => ({
  useSettingsStore: {
    getState: () => ({ pointId: 12, getMySetting: mocks.getMySetting }),
  },
}));

vi.mock('@/entities/order/model/order.store', () => ({
  useOrdersStore: { getState: () => ({ getOrders: mocks.getOrders }) },
}));

vi.mock('@/features/header/model/header.store', () => ({
  useHeaderStore: { getState: () => ({ getStat: mocks.getStat }) },
}));

vi.mock('@/shared/lib/devLog', () => ({ devLog: vi.fn() }));

describe('useConnectivityWatch', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.isOnline = false;
    mocks.startConnectivityWatch.mockReturnValue(vi.fn());
    mocks.refreshSession.mockResolvedValue({ isAuth: true });
    mocks.getMySetting.mockResolvedValue({ point_id: 12 });
    mocks.getOrders.mockResolvedValue(undefined);
    mocks.getStat.mockResolvedValue(undefined);
    mocks.hydrateFinishes.mockResolvedValue(undefined);
    mocks.flushFinishes.mockResolvedValue(undefined);
  });

  it('refreshes session, settings, orders and phones after reconnecting', async () => {
    const { rerender } = renderHook(() => useConnectivityWatch());

    mocks.isOnline = true;
    rerender();

    await waitFor(() => {
      expect(mocks.hydrateFinishes).toHaveBeenCalledTimes(1);
      expect(mocks.flushFinishes).toHaveBeenCalledTimes(1);
      expect(mocks.refreshSession).toHaveBeenCalledTimes(1);
      expect(mocks.getMySetting).toHaveBeenCalledWith('token');
      expect(mocks.getOrders).toHaveBeenCalledWith(false);
      expect(mocks.getStat).toHaveBeenCalledWith('token', 12);
    });
  });

  it('restores saved completions without sending them while offline', () => {
    renderHook(() => useConnectivityWatch());

    expect(mocks.hydrateFinishes).toHaveBeenCalledTimes(1);
    expect(mocks.flushFinishes).not.toHaveBeenCalled();
    expect(mocks.refreshSession).not.toHaveBeenCalled();
    expect(mocks.getOrders).not.toHaveBeenCalled();
  });

  it('sends saved completions on a cold online start', () => {
    mocks.isOnline = true;
    renderHook(() => useConnectivityWatch());

    expect(mocks.flushFinishes).toHaveBeenCalledTimes(1);
    expect(mocks.hydrateFinishes).not.toHaveBeenCalled();
  });

  it('retries online every 15 seconds and stops after unmount', () => {
    vi.useFakeTimers();
    mocks.isOnline = true;
    const { unmount } = renderHook(() => useConnectivityWatch());
    try {
      expect(mocks.flushFinishes).toHaveBeenCalledTimes(1);
      act(() => {
        vi.advanceTimersByTime(15000);
      });
      expect(mocks.flushFinishes).toHaveBeenCalledTimes(2);
      unmount();
      act(() => {
        vi.advanceTimersByTime(30000);
      });
      expect(mocks.flushFinishes).toHaveBeenCalledTimes(2);
    } finally {
      unmount();
      vi.clearAllTimers();
      vi.useRealTimers();
    }
  });

  it('stops sending completions when connectivity is lost', () => {
    vi.useFakeTimers();
    mocks.isOnline = true;
    const { rerender, unmount } = renderHook(() => useConnectivityWatch());
    try {
      expect(mocks.flushFinishes).toHaveBeenCalledTimes(1);
      mocks.isOnline = false;
      rerender();
      expect(mocks.hydrateFinishes).toHaveBeenCalledTimes(1);
      act(() => {
        vi.advanceTimersByTime(15000);
      });
      expect(mocks.hydrateFinishes).toHaveBeenCalledTimes(2);
      expect(mocks.flushFinishes).toHaveBeenCalledTimes(1);
    } finally {
      unmount();
      vi.clearAllTimers();
      vi.useRealTimers();
    }
  });

  it('keeps refreshing ordinary data if queue restoration or sending fails', async () => {
    mocks.hydrateFinishes.mockRejectedValueOnce(new Error('storage unavailable'));
    mocks.flushFinishes.mockRejectedValueOnce(new Error('temporary queue error'));
    const { rerender } = renderHook(() => useConnectivityWatch());
    mocks.isOnline = true;
    rerender();

    await waitFor(() => {
      expect(mocks.flushFinishes).toHaveBeenCalledTimes(1);
      expect(mocks.getMySetting).toHaveBeenCalledWith('token');
      expect(mocks.getOrders).toHaveBeenCalledWith(false);
      expect(mocks.getStat).toHaveBeenCalledWith('token', 12);
    });
  });
});
