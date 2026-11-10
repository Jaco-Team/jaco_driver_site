import { beforeEach, describe, expect, it, vi } from 'vitest';

import { fetchMe } from './auth.api';
import { apiConfig, resolveApiSessionTimeoutMs } from '@/shared/api/config';
import { apiRoutes } from '@/shared/api/routes';

const { get, post } = vi.hoisted(() => ({ get: vi.fn(), post: vi.fn() }));

vi.mock('@/shared/api/connector', () => ({
  connector: { rest: { get, post } },
}));

describe('session API', () => {
  it('uses the timeout configured for the current API origin', async () => {
    const user = { user_id: 7, name: 'Водитель' };
    get.mockResolvedValue(user);

    await expect(fetchMe()).resolves.toBe(user);

    expect(get).toHaveBeenCalledWith(apiRoutes.auth.me, { timeout: apiConfig.sessionTimeoutMs });
  });

  it.each([
    ['http://localhost:8080', 45_000],
    ['http://127.0.0.1:8080', 45_000],
    ['https://apidriver.jacochef.ru', 15_000],
  ])('resolves the session timeout for %s', (origin, timeout) => {
    expect(resolveApiSessionTimeoutMs(origin)).toBe(timeout);
  });
});
