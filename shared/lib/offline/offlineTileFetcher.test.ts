import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { createOfflineTileFetcher } from './offlineTileFetcher';

const now = Date.UTC(2026, 9, 5, 12);

describe('offline tile download pacing', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(now);
  });

  afterEach(() => {
    vi.clearAllTimers();
    vi.useRealTimers();
    vi.unstubAllGlobals();
  });

  it('spaces requests across all workers instead of sending a burst', async () => {
    const startedAt: number[] = [];
    vi.stubGlobal(
      'fetch',
      vi.fn(async () => {
        startedAt.push(Date.now());
        return new Response('tile');
      })
    );
    const fetchTile = createOfflineTileFetcher();
    const signal = new AbortController().signal;
    const requests = Array.from({ length: 30 }, (_, index) => fetchTile(`/tile/${index}`, signal));

    await vi.runAllTimersAsync();
    await Promise.all(requests);

    expect(startedAt).toHaveLength(30);
    expect(startedAt[0]).toBe(now);
    for (let index = 1; index < startedAt.length; index += 1) {
      expect(startedAt[index] - startedAt[index - 1]).toBeGreaterThanOrEqual(100);
    }
  });

  it.each(['3', new Date(now + 3000).toUTCString()])(
    'pauses every worker according to Retry-After: %s',
    async (retryAfter) => {
      const fetchMock = vi
        .fn()
        .mockResolvedValueOnce(
          new Response(null, { status: 429, headers: { 'Retry-After': retryAfter } })
        )
        .mockImplementation(async () => new Response('tile'));
      vi.stubGlobal('fetch', fetchMock);
      const fetchTile = createOfflineTileFetcher();
      const signal = new AbortController().signal;
      const requests = [fetchTile('/tile/1', signal), fetchTile('/tile/2', signal)];

      await vi.advanceTimersByTimeAsync(2999);
      expect(fetchMock).toHaveBeenCalledTimes(1);
      await vi.advanceTimersByTimeAsync(101);
      const responses = await Promise.all(requests);

      expect(fetchMock).toHaveBeenCalledTimes(3);
      expect(responses.every((response) => response.ok)).toBe(true);
      expect(fetchMock.mock.calls.map(([url]) => url)).toEqual(['/tile/1', '/tile/2', '/tile/1']);
    }
  );

  it('stops after five throttled attempts with increasing pauses when no header is given', async () => {
    const startedAt: number[] = [];
    const fetchMock = vi.fn(async () => {
      startedAt.push(Date.now() - now);
      return new Response(null, { status: 429 });
    });
    vi.stubGlobal('fetch', fetchMock);
    const request = createOfflineTileFetcher()('/tile', new AbortController().signal);

    await vi.runAllTimersAsync();
    expect((await request).status).toBe(429);
    expect(startedAt).toEqual([0, 1000, 3000, 7000, 15000]);
  });

  it('does not retry authorization failures', async () => {
    const fetchMock = vi.fn(async () => new Response(null, { status: 403 }));
    vi.stubGlobal('fetch', fetchMock);

    const response = await createOfflineTileFetcher()('/tile', new AbortController().signal);

    expect(response.status).toBe(403);
    expect(fetchMock).toHaveBeenCalledTimes(1);
  });

  it('cancels a worker waiting in the shared cooldown without sending another request', async () => {
    const fetchMock = vi.fn(
      async () => new Response(null, { status: 429, headers: { 'Retry-After': '30' } })
    );
    vi.stubGlobal('fetch', fetchMock);
    const controller = new AbortController();
    const request = createOfflineTileFetcher()('/tile', controller.signal);
    const rejected = expect(request).rejects.toMatchObject({ name: 'AbortError' });
    await vi.advanceTimersByTimeAsync(0);

    controller.abort();
    await rejected;
    await vi.runAllTimersAsync();

    expect(fetchMock).toHaveBeenCalledTimes(1);
  });
});
