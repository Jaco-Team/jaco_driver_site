import { renderHook, waitFor } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { useServiceWorker } from './useServiceWorker';

vi.mock('@/shared/lib/devLog', () => ({ devLog: vi.fn() }));

describe('service worker updates', () => {
  const update = vi.fn();
  const register = vi.fn();
  const browserNavigator = { onLine: true, serviceWorker: { register } };

  beforeEach(() => {
    vi.clearAllMocks();
    vi.stubEnv('NODE_ENV', 'production');
    vi.stubEnv('NEXT_PUBLIC_ENABLE_SW', '1');
    update.mockResolvedValue(undefined);
    register.mockResolvedValue({ update });
    browserNavigator.onLine = true;
    vi.stubGlobal('navigator', browserNavigator);
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    vi.unstubAllEnvs();
    vi.restoreAllMocks();
  });

  it('checks for an update when the connection returns and removes listeners on unmount', async () => {
    const hook = renderHook(() => useServiceWorker());
    await waitFor(() => expect(register).toHaveBeenCalledTimes(1));
    window.dispatchEvent(new Event('online'));
    await waitFor(() => expect(update).toHaveBeenCalledTimes(1));

    hook.unmount();
    window.dispatchEvent(new Event('online'));
    expect(update).toHaveBeenCalledTimes(1);
  });

  it('retries a failed registration instead of leaving the site without updates', async () => {
    register.mockRejectedValueOnce(new Error('Network unavailable'));
    const hook = renderHook(() => useServiceWorker());
    await waitFor(() => expect(register).toHaveBeenCalledTimes(1));
    window.dispatchEvent(new Event('online'));
    await waitFor(() => expect(register).toHaveBeenCalledTimes(2));
    expect(register).toHaveBeenLastCalledWith('/sw.js', { scope: '/', updateViaCache: 'none' });
    hook.unmount();
  });

  it('waits for the network when the site initially opens offline', async () => {
    browserNavigator.onLine = false;
    const hook = renderHook(() => useServiceWorker());
    expect(register).not.toHaveBeenCalled();

    browserNavigator.onLine = true;
    window.dispatchEvent(new Event('online'));
    await waitFor(() => expect(register).toHaveBeenCalledTimes(1));
    hook.unmount();
  });

  it('checks for an update when a background tab becomes visible', async () => {
    const visibility = vi.spyOn(document, 'visibilityState', 'get');
    visibility.mockReturnValue('hidden');
    const hook = renderHook(() => useServiceWorker());
    await waitFor(() => expect(register).toHaveBeenCalledTimes(1));
    document.dispatchEvent(new Event('visibilitychange'));
    expect(update).not.toHaveBeenCalled();

    visibility.mockReturnValue('visible');
    document.dispatchEvent(new Event('visibilitychange'));
    await waitFor(() => expect(update).toHaveBeenCalledTimes(1));
    hook.unmount();
  });
});
