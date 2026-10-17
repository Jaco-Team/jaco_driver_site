import { afterEach, describe, expect, it, vi } from 'vitest';

const init = vi.hoisted(() => vi.fn());
vi.mock('@sentry/nextjs', () => ({ init }));

afterEach(() => { vi.unstubAllEnvs(); vi.resetModules(); init.mockReset(); });

describe('Next 16 client instrumentation', () => {
  it('initializes when the module loads without waiting for an unused register export', async () => {
    vi.stubEnv('NEXT_PUBLIC_SENTRY_DSN', 'https://0123456789abcdef0123456789abcdef@sentry.jacochef.ru/3');
    await import('../../instrumentation-client');
    expect(init).toHaveBeenCalledTimes(1);
    expect(init).toHaveBeenCalledWith(expect.objectContaining({ tracesSampleRate: 0, sendDefaultPii: false }));
  });

  it('does not send events to a stale SaaS DSN', async () => {
    vi.stubEnv('NEXT_PUBLIC_SENTRY_DSN', 'https://0123456789abcdef0123456789abcdef@sentry.io/3');
    await import('../../instrumentation-client');
    expect(init).not.toHaveBeenCalled();
  });
});
