import type { NextApiRequest, NextApiResponse } from 'next';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import sessionHandler from '@/pages/api/offline-map/session';
import tileHandler from '@/pages/api/offline-map/yandex-tile';
import { createOfflineMapSession, verifyOfflineMapSession } from './yandexOfflineMap';
import { getMarkerOfflineDetailPlans } from '@/shared/lib/offline/offlineMapDetails';

const bounds = { west: 37.6, south: 55.7, east: 37.61, north: 55.71 };

function response() {
  const res = {
    setHeader: vi.fn(),
    status: vi.fn(),
    json: vi.fn(),
    send: vi.fn(),
  };
  res.status.mockReturnValue(res);
  return res;
}

function request(values: Record<string, unknown>): NextApiRequest {
  return {
    method: 'GET',
    headers: { host: 'localhost:3225', 'x-forwarded-for': 'offline-map-test' },
    query: {},
    socket: { remoteAddress: 'offline-map-test' },
    ...values,
  } as unknown as NextApiRequest;
}

function apiResponse(res: ReturnType<typeof response>): NextApiResponse {
  return res as unknown as NextApiResponse;
}

describe('offline map API', () => {
  beforeEach(() => {
    vi.stubEnv('YANDEX_TILES_API_KEY', 'test-yandex-tiles-key-long-enough');
    vi.stubEnv('NEXT_PUBLIC_API_ORIGIN', 'https://backend.example');
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    vi.unstubAllEnvs();
  });

  it('requires authorization before issuing a session', async () => {
    const fetchMock = vi.fn();
    vi.stubGlobal('fetch', fetchMock);
    const res = response();
    await sessionHandler(
      request({ method: 'POST', body: { pointId: 1, bounds, minZoom: 10, maxZoom: 10 } }),
      apiResponse(res)
    );
    expect(res.status).toHaveBeenCalledWith(401);
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it('checks backend authorization and issues a signed session', async () => {
    const fetchMock = vi.fn().mockResolvedValue({ ok: true, status: 200 });
    vi.stubGlobal('fetch', fetchMock);
    const res = response();
    await sessionHandler(
      request({
        method: 'POST',
        headers: { authorization: 'Bearer token' },
        body: { pointId: 7, bounds, minZoom: 10, maxZoom: 10 },
      }),
      apiResponse(res)
    );
    expect(fetchMock).toHaveBeenCalledWith(
      'https://backend.example/api/v1/auth/me',
      expect.objectContaining({
        headers: expect.objectContaining({ Authorization: 'Bearer token' }),
      })
    );
    expect(res.status).toHaveBeenCalledWith(200);
    expect(verifyOfflineMapSession(res.json.mock.calls[0][0].session)?.pointId).toBe('7');
  });

  it('rejects a session when backend authentication expires', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({ ok: false, status: 401 }));
    const res = response();
    await sessionHandler(
      request({
        method: 'POST',
        headers: { authorization: 'Bearer expired' },
        body: { pointId: 7, bounds, minZoom: 10, maxZoom: 10 },
      }),
      apiResponse(res)
    );
    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).not.toHaveBeenCalledWith(
      expect.objectContaining({ session: expect.anything() })
    );
  });

  it('passes detailed cells through the same authenticated session endpoint', async () => {
    const plan = getMarkerOfflineDetailPlans([[53.52, 49.42]])[0];
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({ ok: true, status: 200 }));
    const res = response();
    await sessionHandler(
      request({
        method: 'POST',
        headers: { authorization: 'Bearer token' },
        body: { detailTile: plan.detailTile },
      }),
      apiResponse(res)
    );
    expect(res.status).toHaveBeenCalledWith(200);
    const payload = verifyOfflineMapSession(res.json.mock.calls[0][0].session);
    expect(payload?.pointId).toBe(plan.pointId);
    expect(payload?.ranges.at(-1)?.z).toBe(19);
  });

  it('serves only image tiles inside the signed area', async () => {
    const session = createOfflineMapSession({ pointId: 7, bounds, minZoom: 10, maxZoom: 10 })!;
    const range = verifyOfflineMapSession(session)!.ranges[0];
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      headers: new Headers({ 'content-type': 'image/png' }),
      arrayBuffer: async () => Uint8Array.from([1, 2, 3]).buffer,
    });
    vi.stubGlobal('fetch', fetchMock);
    const query = { session, x: String(range.minX), y: String(range.minY), z: '10' };

    const denied = response();
    await tileHandler(
      request({ query: { ...query, x: String(range.minX - 1) } }),
      apiResponse(denied)
    );
    expect(denied.status).toHaveBeenCalledWith(400);
    expect(fetchMock).not.toHaveBeenCalled();

    const allowed = response();
    await tileHandler(request({ query }), apiResponse(allowed));
    expect(allowed.status).toHaveBeenCalledWith(200);
    expect(allowed.setHeader).toHaveBeenCalledWith('Content-Type', 'image/png');
    expect(allowed.send.mock.calls[0][0]).toEqual(Buffer.from([1, 2, 3]));
    expect(fetchMock.mock.calls[0][1].headers.Referer).toBe('http://localhost:3225/map_orders');
  });

  it('rejects non-image upstream responses', async () => {
    const session = createOfflineMapSession({ pointId: 7, bounds, minZoom: 10, maxZoom: 10 })!;
    const range = verifyOfflineMapSession(session)!.ranges[0];
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({
        ok: true,
        headers: new Headers({ 'content-type': 'text/html' }),
      })
    );
    const res = response();
    await tileHandler(
      request({ query: { session, x: String(range.minX), y: String(range.minY), z: '10' } }),
      apiResponse(res)
    );
    expect(res.status).toHaveBeenCalledWith(502);
    expect(res.send).not.toHaveBeenCalled();
  });

  it.each(['5', null])('forwards the upstream throttling delay (%s)', async (retryAfter) => {
    const session = createOfflineMapSession({ pointId: 7, bounds, minZoom: 10, maxZoom: 10 })!;
    const range = verifyOfflineMapSession(session)!.ranges[0];
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({
        ok: false,
        status: 429,
        headers: new Headers(retryAfter ? { 'Retry-After': retryAfter } : {}),
      })
    );
    const res = response();
    await tileHandler(
      request({ query: { session, x: String(range.minX), y: String(range.minY), z: '10' } }),
      apiResponse(res)
    );

    expect(res.status).toHaveBeenCalledWith(429);
    expect(res.setHeader).toHaveBeenCalledWith('Retry-After', retryAfter || '1');
    expect(res.json).toHaveBeenCalledWith({ error: 'Yandex Tiles API вернул HTTP 429.' });
  });

  it('limits tile requests per client before contacting Yandex', async () => {
    const session = createOfflineMapSession({ pointId: 7, bounds, minZoom: 10, maxZoom: 10 })!;
    const range = verifyOfflineMapSession(session)!.ranges[0];
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      headers: new Headers({ 'content-type': 'image/png' }),
      arrayBuffer: async () => Uint8Array.from([1]).buffer,
    });
    vi.stubGlobal('fetch', fetchMock);
    const req = request({
      headers: { 'x-forwarded-for': 'rate-limit-test-client' },
      query: { session, x: String(range.minX), y: String(range.minY), z: '10' },
    });

    for (let count = 0; count < 24; count += 1) {
      await tileHandler(req, apiResponse(response()));
    }
    const blocked = response();
    await tileHandler(req, apiResponse(blocked));

    expect(fetchMock).toHaveBeenCalledTimes(24);
    expect(blocked.status).toHaveBeenCalledWith(429);
    expect(blocked.setHeader).toHaveBeenCalledWith('Retry-After', '1');
  });
});
