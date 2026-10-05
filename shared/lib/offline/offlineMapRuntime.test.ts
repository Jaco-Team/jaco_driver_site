import { afterEach, describe, expect, it, vi } from 'vitest';
import {
  loadOfflineMapRuntime,
  OFFLINE_MAP_RUNTIME_VERSION,
  OFFLINE_MAP_RUNTIME_URL,
} from './offlineMapRuntime';

describe('offline map runtime preparation', () => {
  afterEach(() => {
    delete window.JacoOfflineOrdersMap;
    document.getElementById('jaco-offline-orders-map-runtime')?.remove();
  });

  it('shares the online load and reuses the executed module when opening offline', async () => {
    const first = loadOfflineMapRuntime();
    const concurrent = loadOfflineMapRuntime();
    expect(concurrent).toBe(first);
    const script = document.getElementById('jaco-offline-orders-map-runtime') as HTMLScriptElement;
    expect(script.src).toBe(new URL(OFFLINE_MAP_RUNTIME_URL, window.location.origin).href);
    const runtime = { version: OFFLINE_MAP_RUNTIME_VERSION, mount: vi.fn() };
    window.JacoOfflineOrdersMap = runtime;
    script.dispatchEvent(new Event('load'));
    await expect(first).resolves.toBe(runtime);

    const append = vi.spyOn(document.head, 'append');
    await expect(loadOfflineMapRuntime()).resolves.toBe(runtime);
    expect(append).not.toHaveBeenCalled();
    append.mockRestore();
  });
});
