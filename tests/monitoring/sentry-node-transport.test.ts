// @vitest-environment node
import { describe, expect, it } from 'vitest';
import * as Sentry from '@sentry/node';
import type { Envelope } from '@sentry/core';
import { errorMonitoringOptions } from '@/shared/lib/monitoring/sentry';

const dsn = 'https://0123456789abcdef0123456789abcdef@sentry.jacochef.ru/3';

describe('real SDK Node envelope without networking', () => {
  it('removes ProcessSession from real SDK defaults and sends only the cleaned error', async () => {
    const envelopes: Envelope[] = [];
    const client = Sentry.init({
      ...errorMonitoringOptions(dsn),
      defaultIntegrations: Sentry.getDefaultIntegrationsWithoutPerformance(),
      transport: () => ({
        send: async (envelope) => { envelopes.push(envelope); return { statusCode: 200 }; },
        flush: async () => true,
      }),
    });
    try {
      expect(client?.getIntegrationByName('ProcessSession')).toBeUndefined();
      client?.captureException(new Error('synthetic failure token=synthetic-secret'));
      client?.emit('startRequestSession');
      expect(await client?.flush(2000)).toBe(true);
      const items = envelopes.flatMap<Envelope[1][number]>(([, payload]) => payload);
      expect(items.map(([header]) => header.type)).toEqual(['event']);
      expect(JSON.stringify(envelopes)).not.toContain('synthetic-secret');
      expect((items[0][1] as Sentry.Event).exception?.values?.[0]?.value).toContain('[Filtered]');
    } finally {
      await client?.close(2000);
    }
  });
});
