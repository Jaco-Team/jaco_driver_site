import { readFileSync } from 'node:fs';
import { runInNewContext } from 'node:vm';
import { describe, expect, it, vi } from 'vitest';

const workerSource = readFileSync(`${import.meta.dirname}/../../../public/sw.js`, 'utf8');

describe('offline map service worker cache', () => {
  it.each([
    '/offline-map/offline-orders-map.mjs?v=25',
    '/offline-map/runtime/maplibre-gl.mjs?v=6.11.2',
    '/offline-map/runtime/maplibre-gl-shared.mjs?v=6.11.2',
    '/offline-map/runtime/maplibre-gl-worker.mjs?v=6.11.2',
  ])('serves %s offline despite a different Accept-Encoding header', async (path) => {
    const cached = new Response('cached module', {
      headers: { 'Content-Type': 'application/javascript', Vary: 'Accept-Encoding' },
    });
    const match = vi.fn(async (_request: Request, options?: CacheQueryOptions) =>
      options?.ignoreVary ? cached : undefined
    );
    const fetchMock = vi.fn().mockRejectedValue(new Error('Offline'));
    const listeners: Record<string, (event: unknown) => void> = {};
    runInNewContext(workerSource, {
      self: {
        location: { origin: window.location.origin },
        addEventListener: (name: string, callback: (event: unknown) => void) => {
          listeners[name] = callback;
        },
      },
      caches: { match },
      fetch: fetchMock,
      URL,
    });
    const request = new Request(new URL(path, window.location.origin));
    const respondWith = vi.fn();

    listeners.fetch({ request, respondWith });

    expect(respondWith).toHaveBeenCalledTimes(1);
    await expect(respondWith.mock.calls[0][0]).resolves.toBe(cached);
    expect(match).toHaveBeenCalledWith(request, { ignoreVary: true });
    expect(fetchMock).not.toHaveBeenCalled();
  });
});
