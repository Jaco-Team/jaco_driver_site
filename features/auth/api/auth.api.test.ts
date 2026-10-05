import { describe, expect, it, vi } from 'vitest';

import { fetchMe } from './auth.api';
import { apiRoutes } from '@/shared/api/routes';

const get = vi.hoisted(() => vi.fn());

vi.mock('@/shared/api/connector', () => ({
  connector: { rest: { get } },
}));

describe('session API', () => {
  it('bounds the session check to 15 seconds', async () => {
    const user = { user_id: 7, name: 'Водитель' };
    get.mockResolvedValue(user);

    await expect(fetchMe()).resolves.toBe(user);

    expect(get).toHaveBeenCalledWith(apiRoutes.auth.me, { timeout: 15_000 });
  });
});
