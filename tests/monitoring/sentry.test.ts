import { describe, expect, it } from 'vitest';
import type { ErrorEvent, EventHint } from '@sentry/nextjs';
import {
  errorMonitoringOptions, safeText, safeUrl, sanitizeBreadcrumb,
  sanitizeErrorEvent, selfHostedDsn,
} from '@/shared/lib/monitoring/sentry';

const dsn = 'https://0123456789abcdef0123456789abcdef@sentry.jacochef.ru/3';

describe('self-hosted telemetry boundary', () => {
  it('accepts only the own HTTPS ingestion host with a public DSN key', () => {
    expect(selfHostedDsn(dsn)).toBe(dsn);
    for (const invalid of [undefined, '', 'not-a-url', dsn.replace('https:', 'http:'),
      dsn.replace('sentry.jacochef.ru', 'sentry.io'), `${dsn}?token=secret`,
      dsn.replace('@', ':private@'), dsn.replace('/3', '/3/envelope/')]) {
      expect(selfHostedDsn(invalid)).toBeUndefined();
    }
  });

  it('drops credentials, query strings and personal identifiers but keeps asset identity', () => {
    expect(safeUrl('https://user:password@api.example/orders/12345678?token=secret#email'))
      .toBe('https://api.example/orders/[Filtered]');
    expect(safeUrl('/orders?phone=79990000000')).toBe('/orders');
    expect(safeUrl('app:///pages/index.js?token=secret')).toBe('app:///pages/index.js');
    expect(safeUrl('node:internal/process/task_queues')).toBe('node:internal/process/task_queues');
    const asset = 'https://driver.jacochef.ru/_next/static/chunks/0123456789abcdef0123456789abcdef.js';
    expect(safeUrl(`${asset}?token=secret`)).toBe(asset);
    const cleaned = safeText('Failed https://api.example/a?token=secret Bearer secretJWT token=abc person@example.org +7 (999) 123-45-67');
    for (const value of ['secret', 'secretJWT', 'abc', 'person@example.org', '123-45-67']) {
      expect(cleaned).not.toContain(value);
    }
  });

  it('removes SDK request/user additions, attachments and frame variables before transport', () => {
    const hint: EventHint = { attachments: [{ filename: 'private.txt', data: 'secret' }] };
    const event: ErrorEvent = {
      type: undefined,
      event_id: 'event', release: 'jaco-driver-frontend@commit', environment: 'production',
      message: 'token=secret person@example.org', user: { id: '123', email: 'person@example.org' },
      contexts: { custom: { secret: 'value' } }, extra: { password: 'secret' },
      tags: { customer: 'person@example.org' }, server_name: 'internal-host',
      request: { url: 'https://driver.jacochef.ru/orders?token=secret',
        headers: { Authorization: 'Bearer secret' }, cookies: { session: 'secret' }, data: 'private-body' },
      exception: { values: [{ type: 'Error', value: 'token=secret', stacktrace: { frames: [{
        filename: 'https://driver.jacochef.ru/_next/static/chunk.js?token=secret',
        lineno: 42, colno: 7, function: 'loadOrders', vars: { password: 'secret' },
      }] } }] },
      debug_meta: { images: [] },
    };
    const sanitized = sanitizeErrorEvent(event, hint);
    expect(sanitized.release).toBe(event.release);
    expect(sanitized.exception?.values?.[0].stacktrace?.frames?.[0]).toMatchObject({ lineno: 42, colno: 7, function: 'loadOrders' });
    expect(sanitized.request).toEqual({ url: 'https://driver.jacochef.ru/orders' });
    for (const key of ['user', 'contexts', 'extra', 'tags', 'server_name']) {
      expect(sanitized).not.toHaveProperty(key);
    }
    expect(JSON.stringify(sanitized)).not.toMatch(/secret|person@example|private-body|Authorization|password/);
    expect(hint.attachments).toEqual([]);
  });

  it('retains only HTTP/navigation breadcrumb metadata', () => {
    expect(sanitizeBreadcrumb({ category: 'console', message: 'password=secret' })).toBeNull();
    expect(sanitizeBreadcrumb({ category: 'ui.click', message: 'person@example.org' })).toBeNull();
    expect(sanitizeBreadcrumb({ type: 'http', data: { url: '/api?token=secret', method: 'POST',
      status_code: 401, body: 'private', headers: { Authorization: 'secret' } } })?.data)
      .toEqual({ url: '/api', method: 'POST', status_code: 401 });
  });

  it('disables collection with the SDK 11 API and keeps non-error telemetry off', () => {
    const options = errorMonitoringOptions(dsn);
    expect(options.integrations([{ name: 'BrowserSession' }, { name: 'ProcessSession' }, { name: 'GlobalHandlers' }, { name: 'BrowserTracing' }, { name: 'Console' }]))
      .toEqual([{ name: 'GlobalHandlers' }]);
    expect(options).not.toHaveProperty('sendDefaultPii');
    expect(options).not.toHaveProperty('enableLogs');
    expect(options.beforeSendLog()).toBeNull();
    expect(options.beforeSendMetric()).toBeNull();
    expect(options).toMatchObject({
      dataCollection: {
        userInfo: false, cookies: false, httpHeaders: false, httpBodies: [],
        urlQueryParams: false, graphQL: { document: false, variables: false },
        genAI: { inputs: false, outputs: false }, databaseQueryData: false,
        queues: false, stackFrameVariables: false, frameContextLines: 0,
      },
      sendClientReports: false,
      tracesSampleRate: 0, replaysSessionSampleRate: 0, replaysOnErrorSampleRate: 0,
    });
  });
});
