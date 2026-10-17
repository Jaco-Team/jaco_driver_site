import { describe, expect, it } from 'vitest';
import * as Sentry from '@sentry/browser';
import type { Envelope } from '@sentry/core';
import { errorMonitoringOptions } from '@/shared/lib/monitoring/sentry';

const dsn = 'https://0123456789abcdef0123456789abcdef@sentry.jacochef.ru/3';

describe('real SDK browser envelope without networking', () => {
  it('denies Relay IP inference after beforeSend and emits no browser session envelopes', async () => {
    const envelopes: Envelope[] = [];
    const client = Sentry.init({
      ...errorMonitoringOptions(dsn),
      transport: () => ({
        send: async (envelope) => { envelopes.push(envelope); return { statusCode: 200 }; },
        flush: async () => true,
      }),
    });
    try {
      expect(client).toBeDefined();
      expect(client?.getIntegrationByName('BrowserSession')).toBeUndefined();
      client?.captureEvent({ message: 'synthetic privacy boundary',
        user: { id: 'synthetic-user', email: 'private@example.org', ip_address: '192.0.2.123' },
        request: { url: 'https://driver.jacochef.ru/list_orders?token=synthetic-secret',
          headers: { Authorization: 'Bearer synthetic-secret' }, cookies: { session: 'synthetic-secret' } },
      });
      document.dispatchEvent(new Event('visibilitychange'));
      expect(await client?.flush(2000)).toBe(true);
      const items = envelopes.flatMap<Envelope[1][number]>(([, payload]) => payload);
      expect(items.map(([header]) => header.type)).toEqual(['event']);
      const event = items[0][1] as Sentry.Event;
      expect(event.sdk?.settings).toMatchObject({ infer_ip: 'never' });
      expect(event.user).toBeUndefined();
      expect(event.request).toEqual({ url: 'https://driver.jacochef.ru/list_orders' });
      expect(JSON.stringify(envelopes)).not.toMatch(/synthetic-secret|private@example|192\.0\.2\.123/);
    } finally {
      await client?.close(2000);
    }
  });
});
