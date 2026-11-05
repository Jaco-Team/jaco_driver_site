import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { renderHook } from '@testing-library/react';

import {
  ORDERS_RETURN_REFRESH_COALESCE_MS,
  useOrdersRefreshOnReturn,
} from './useOrdersRefreshOnReturn';

const mocks = vi.hoisted(() => ({
  getOrders: vi.fn(),
  isLoad: false,
  isOnline: true,
}));

vi.mock('@/entities/order/model/order.store', () => ({
  useOrdersStore: {
    getState: () => ({ getOrders: mocks.getOrders, is_load: mocks.isLoad }),
  },
}));

vi.mock('@/features/offline/model/connectivity.store', () => ({
  isAppOnline: () => mocks.isOnline,
}));

vi.mock('@/shared/lib/devLog', () => ({ devLog: vi.fn() }));

let visibility: DocumentVisibilityState = 'visible';

function setVisibility(state: DocumentVisibilityState) {
  visibility = state;
  document.dispatchEvent(new Event('visibilitychange'));
}

function pageShow(persisted: boolean) {
  const event = new Event('pageshow') as PageTransitionEvent;
  Object.defineProperty(event, 'persisted', { value: persisted });
  window.dispatchEvent(event);
}

describe('useOrdersRefreshOnReturn', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.clearAllMocks();
    mocks.isLoad = false;
    mocks.isOnline = true;
    visibility = 'visible';
    vi.spyOn(document, 'visibilityState', 'get').mockImplementation(() => visibility);
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.restoreAllMocks();
  });

  it('refreshes orders once when the page becomes visible again', () => {
    renderHook(() => useOrdersRefreshOnReturn());

    setVisibility('hidden');
    expect(mocks.getOrders).not.toHaveBeenCalled();

    setVisibility('visible');
    window.dispatchEvent(new Event('focus'));

    expect(mocks.getOrders).toHaveBeenCalledTimes(1);
    expect(mocks.getOrders).toHaveBeenCalledWith(false);
  });

  it('refreshes again on a later return', () => {
    renderHook(() => useOrdersRefreshOnReturn());

    setVisibility('visible');
    vi.advanceTimersByTime(ORDERS_RETURN_REFRESH_COALESCE_MS);
    window.dispatchEvent(new Event('focus'));

    expect(mocks.getOrders).toHaveBeenCalledTimes(2);
  });

  it('refreshes after restoring the page from bfcache only', () => {
    renderHook(() => useOrdersRefreshOnReturn());

    pageShow(false);
    expect(mocks.getOrders).not.toHaveBeenCalled();

    pageShow(true);
    expect(mocks.getOrders).toHaveBeenCalledTimes(1);
  });

  it('skips refresh while offline, during an order action or when disabled', () => {
    const { rerender } = renderHook(({ enabled }) => useOrdersRefreshOnReturn(enabled), {
      initialProps: { enabled: true },
    });

    mocks.isOnline = false;
    setVisibility('visible');
    mocks.isOnline = true;
    mocks.isLoad = true;
    vi.advanceTimersByTime(ORDERS_RETURN_REFRESH_COALESCE_MS);
    window.dispatchEvent(new Event('focus'));
    mocks.isLoad = false;

    rerender({ enabled: false });
    vi.advanceTimersByTime(ORDERS_RETURN_REFRESH_COALESCE_MS);
    setVisibility('visible');

    expect(mocks.getOrders).not.toHaveBeenCalled();
  });

  it('removes listeners on unmount', () => {
    const { unmount } = renderHook(() => useOrdersRefreshOnReturn());
    unmount();

    setVisibility('visible');
    window.dispatchEvent(new Event('focus'));
    pageShow(true);

    expect(mocks.getOrders).not.toHaveBeenCalled();
  });
});
