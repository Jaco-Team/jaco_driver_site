import { renderHook, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { useConnectivityWatch } from './useConnectivityWatch';

const mocks = vi.hoisted(() => ({
  isOnline: false,
  startConnectivityWatch: vi.fn(() => vi.fn()),
  refreshSession: vi.fn(),
  getMySetting: vi.fn(),
  getOrders: vi.fn(),
  getStat: vi.fn(),
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
  });

  it('refreshes session, settings, orders and phones after reconnecting', async () => {
    const { rerender } = renderHook(() => useConnectivityWatch());

    mocks.isOnline = true;
    rerender();

    await waitFor(() => {
      expect(mocks.refreshSession).toHaveBeenCalledTimes(1);
      expect(mocks.getMySetting).toHaveBeenCalledWith('token');
      expect(mocks.getOrders).toHaveBeenCalledWith(false);
      expect(mocks.getStat).toHaveBeenCalledWith('token', 12);
    });
  });
});
