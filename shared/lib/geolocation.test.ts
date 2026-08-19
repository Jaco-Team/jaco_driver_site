import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { describeGeolocationError, readDriverPosition } from './geolocation';

type GeoError = { code: number; message: string };

function installGeolocation(options: {
  permission?: PermissionState | 'unknown';
  positions?: Array<
    { ok: true; coords: { latitude: number; longitude: number } } | { ok: false; error: GeoError }
  >;
}) {
  const positions = [...(options.positions ?? [])];

  Object.defineProperty(globalThis.navigator, 'permissions', {
    configurable: true,
    value:
      options.permission && options.permission !== 'unknown'
        ? {
            query: vi.fn().mockResolvedValue({ state: options.permission }),
          }
        : undefined,
  });

  Object.defineProperty(globalThis.navigator, 'geolocation', {
    configurable: true,
    value: {
      getCurrentPosition: vi.fn((success: PositionCallback, error?: PositionErrorCallback) => {
        const next = positions.shift();

        if (!next) {
          error?.({ code: 3, message: 'Timeout expired' } as GeolocationPositionError);
          return;
        }

        if (next.ok) {
          success({ coords: next.coords } as GeolocationPosition);
          return;
        }

        error?.(next.error as GeolocationPositionError);
      }),
    },
  });
}

describe('geolocation', () => {
  const originalGeolocation = navigator.geolocation;
  const originalPermissions = navigator.permissions;

  afterEach(() => {
    Object.defineProperty(globalThis.navigator, 'geolocation', {
      configurable: true,
      value: originalGeolocation,
    });
    Object.defineProperty(globalThis.navigator, 'permissions', {
      configurable: true,
      value: originalPermissions,
    });
  });

  describe('describeGeolocationError', () => {
    it('explains permission denied in Russian and blocks the action', () => {
      const result = describeGeolocationError({ code: 1, message: 'User denied Geolocation' });

      expect(result.canContinue).toBe(false);
      expect(result.text).toContain('Нет доступа к геолокации');
      expect(result.text).not.toContain('User denied Geolocation');
    });

    it('explains insecure origin in Russian and blocks the action', () => {
      const result = describeGeolocationError({
        code: 1,
        message: 'Only secure origins are allowed',
      });

      expect(result.canContinue).toBe(false);
      expect(result.text).toContain('https');
    });

    it('allows continue after timeout', () => {
      const result = describeGeolocationError({ code: 3, message: 'Timeout expired' });

      expect(result.canContinue).toBe(true);
      expect(result.text).toContain('слишком долго');
    });

    it('allows continue when position is unavailable', () => {
      const result = describeGeolocationError({ code: 2, message: 'Position unavailable' });

      expect(result.canContinue).toBe(true);
      expect(result.text).toContain('Не удалось определить местоположение');
    });
  });

  describe('readDriverPosition', () => {
    beforeEach(() => {
      vi.restoreAllMocks();
    });

    it('returns coords on the first high-accuracy attempt', async () => {
      installGeolocation({
        permission: 'granted',
        positions: [{ ok: true, coords: { latitude: 53.5, longitude: 49.4 } }],
      });

      await expect(readDriverPosition()).resolves.toEqual({
        latitude: '53.5',
        longitude: '49.4',
        blocked: false,
        message: null,
      });
    });

    it('blocks immediately when permission is denied', async () => {
      installGeolocation({
        permission: 'denied',
        positions: [{ ok: true, coords: { latitude: 1, longitude: 2 } }],
      });

      const result = await readDriverPosition();

      expect(result.blocked).toBe(true);
      expect(result.latitude).toBe('');
      expect(result.message).toContain('Нет доступа к геолокации');
      expect(navigator.geolocation.getCurrentPosition).not.toHaveBeenCalled();
    });

    it('retries after timeout and continues without coords if GPS never arrives', async () => {
      installGeolocation({
        permission: 'granted',
        positions: [
          { ok: false, error: { code: 3, message: 'Timeout expired' } },
          { ok: false, error: { code: 3, message: 'Timeout expired' } },
        ],
      });

      const result = await readDriverPosition();

      expect(result).toEqual({
        latitude: '',
        longitude: '',
        blocked: false,
        message: null,
      });
      expect(navigator.geolocation.getCurrentPosition).toHaveBeenCalledTimes(2);
      expect(navigator.geolocation.getCurrentPosition).toHaveBeenNthCalledWith(
        1,
        expect.any(Function),
        expect.any(Function),
        expect.objectContaining({ enableHighAccuracy: true, timeout: 15000 })
      );
      expect(navigator.geolocation.getCurrentPosition).toHaveBeenNthCalledWith(
        2,
        expect.any(Function),
        expect.any(Function),
        expect.objectContaining({ enableHighAccuracy: false, timeout: 10000 })
      );
    });

    it('uses the low-accuracy retry when the first attempt times out', async () => {
      installGeolocation({
        permission: 'granted',
        positions: [
          { ok: false, error: { code: 3, message: 'Timeout expired' } },
          { ok: true, coords: { latitude: 53.51, longitude: 49.41 } },
        ],
      });

      await expect(readDriverPosition()).resolves.toMatchObject({
        latitude: '53.51',
        longitude: '49.41',
        blocked: false,
      });
    });
  });
});
