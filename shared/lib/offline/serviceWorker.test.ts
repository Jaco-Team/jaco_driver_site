import { readFileSync } from 'node:fs';
import { runInNewContext } from 'node:vm';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { OFFLINE_MAP_ASSET_PATHS } from './offlineMapAssets';

const workerSource = readFileSync(`${import.meta.dirname}/../../../public/sw.js`, 'utf8');

function createWorker() {
  const match = vi.fn().mockResolvedValue(undefined);
  const put = vi.fn().mockResolvedValue(undefined);
  const open = vi.fn().mockResolvedValue({ put });
  const fetchMock = vi.fn().mockResolvedValue(new Response('network'));
  const listeners: Record<string, (event: unknown) => void> = {};

  runInNewContext(workerSource, {
    self: {
      location: { origin: window.location.origin },
      addEventListener: (name: string, callback: (event: unknown) => void) => {
        listeners[name] = callback;
      },
    },
    caches: { match, open },
    fetch: fetchMock,
    URL,
    AbortController,
    setTimeout,
    clearTimeout,
  });

  function request(path: string, mode: RequestMode = 'cors') {
    const respondWith = vi.fn();
    const input = {
      url: new URL(path, window.location.origin).href,
      method: 'GET',
      headers: new Headers(),
      mode,
    };
    listeners.fetch({ request: input, respondWith });
    expect(respondWith).toHaveBeenCalledTimes(1);
    return respondWith.mock.calls[0][0] as Promise<Response>;
  }

  return { match, put, open, fetchMock, request };
}

describe('service worker network fallbacks', () => {
  afterEach(() => {
    vi.useRealTimers();
  });

  it('aborts a stalled navigation after 15 seconds and serves the cached page', async () => {
    vi.useFakeTimers();
    const worker = createWorker();
    const cached = new Response('cached page');
    worker.match.mockResolvedValue(cached);
    let signal: AbortSignal | undefined;
    worker.fetchMock.mockImplementation((_request, options: RequestInit) => {
      signal = options.signal as AbortSignal;
      return new Promise((_resolve, reject) => {
        signal?.addEventListener('abort', () => reject(new DOMException('Timeout', 'AbortError')));
      });
    });

    const response = worker.request('/list_orders', 'navigate');
    await vi.advanceTimersByTimeAsync(14_999);
    expect(signal?.aborted).toBe(false);
    expect(worker.match).not.toHaveBeenCalled();
    await vi.advanceTimersByTimeAsync(1);

    await expect(response).resolves.toBe(cached);
    expect(signal?.aborted).toBe(true);
    expect(vi.getTimerCount()).toBe(0);
  });

  it('serves the offline screen when navigation fails without a saved page', async () => {
    const worker = createWorker();
    const offline = new Response('offline screen');
    worker.fetchMock.mockRejectedValue(new Error('Offline'));
    worker.match.mockImplementation(async (request) =>
      request === '/offline.html' ? offline : undefined
    );

    await expect(worker.request('/list_orders', 'navigate')).resolves.toBe(offline);
  });

  it.each(['jaco-assets-v44', 'jaco-offline-app-v2'])(
    'serves an immutable Next.js chunk from %s without waiting for the network',
    async (cacheName) => {
      const worker = createWorker();
      const cached = new Response('cached chunk');
      worker.match.mockImplementation(async (_request, options: MultiCacheQueryOptions) =>
        options.cacheName === cacheName ? cached : undefined
      );

      await expect(worker.request('/_next/static/chunks/page-123abc.js')).resolves.toBe(cached);
      expect(worker.fetchMock).not.toHaveBeenCalled();
      expect(worker.match).toHaveBeenCalledWith(expect.anything(), {
        cacheName,
        ignoreVary: true,
      });
    }
  );

  it('fetches and caches a chunk that has not been saved', async () => {
    const worker = createWorker();
    const response = new Response('new chunk');
    worker.fetchMock.mockResolvedValue(response);

    await expect(worker.request('/_next/static/chunks/page-456def.js')).resolves.toBe(response);
    expect(worker.open).toHaveBeenCalledWith('jaco-assets-v44');
    expect(worker.put).toHaveBeenCalledTimes(1);
    for (const [, options] of worker.match.mock.calls) {
      expect(options).not.toHaveProperty('ignoreSearch');
    }
  });

  it.each([
    ['/list_orders', 'navigate'],
    ['/_next/static/chunks/page-123abc.js', 'cors'],
    ['/offline-map/offline-orders-map.mjs?v=29', 'cors'],
  ] as const)('keeps a successful response for %s when the cache is full', async (path, mode) => {
    const worker = createWorker();
    const response = new Response('network response');
    worker.fetchMock.mockResolvedValue(response);
    worker.put.mockRejectedValue(new DOMException('Cache is full', 'QuotaExceededError'));

    await expect(worker.request(path, mode)).resolves.toBe(response);
  });

  it.each([
    ['/_next/static/chunks/page-123abc.js', 'cors'],
    ['/offline-map/offline-orders-map.mjs?v=29', 'cors'],
    ['/icon.svg', 'cors'],
    ['/list_orders', 'navigate'],
  ] as const)('uses the network for %s when Cache Storage is unavailable', async (path, mode) => {
    const worker = createWorker();
    const response = new Response('network response');
    worker.fetchMock.mockResolvedValue(response);
    worker.match.mockRejectedValue(new Error('Cache unavailable'));
    worker.open.mockRejectedValue(new Error('Cache unavailable'));

    await expect(worker.request(path, mode)).resolves.toBe(response);
  });

  it('clears the timeout after a quick response', async () => {
    vi.useFakeTimers();
    const worker = createWorker();

    await worker.request('/list_orders', 'navigate');

    expect(vi.getTimerCount()).toBe(0);
  });
});

describe('offline map service worker cache', () => {
  it.each(OFFLINE_MAP_ASSET_PATHS)(
    'serves %s offline despite a different Accept-Encoding header',
    async (path) => {
      expect(workerSource).toContain(`'${path}'`);
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
    }
  );
});
