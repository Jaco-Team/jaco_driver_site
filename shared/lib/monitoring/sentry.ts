import type { Breadcrumb, BrowserOptions, ErrorEvent, EventHint } from '@sentry/nextjs';

export const SENTRY_ORIGIN = 'https://sentry.jacochef.ru';

// The DSN is a public routing key, but telemetry must never fall back to SaaS.
export function selfHostedDsn(value: string | undefined): string | undefined {
  if (!value) return undefined;
  try {
    const url = new URL(value);
    if (
      url.origin !== SENTRY_ORIGIN || url.password || url.search || url.hash ||
      !/^[a-zA-Z0-9]{16,64}$/.test(url.username) || !/^\/[0-9]+$/.test(url.pathname)
    ) return undefined;
    return value;
  } catch {
    return undefined;
  }
}

export function safeUrl(value: string): string {
  try {
    const absolute = /^[a-z][a-z0-9+.-]*:/i.test(value);
    const url = new URL(value, 'https://redacted.invalid');
    if (!['http:', 'https:', 'file:', 'webpack:', 'webpack-internal:', 'app:', 'node:'].includes(url.protocol)) return '[Filtered]';
    const path = url.pathname.split('/').map((part) => {
      if (/^[a-zA-Z0-9_-]{24,}$/.test(part) || /\d{7,}/.test(part) || /@|%40/i.test(part)) {
        // Keep immutable Next asset names so symbolication can find the bundle.
        if (url.pathname.startsWith('/_next/static/')) return part;
        return '[Filtered]';
      }
      return part;
    }).join('/');
    if (url.protocol === 'node:') return `node:${path}`;
    return absolute ? `${url.protocol}//${url.host}${path}` : path;
  } catch {
    return '[Filtered]';
  }
}

export function safeText(value: string): string {
  return value
    .replace(/https?:\/\/[^\s<>"']+/gi, (url) => safeUrl(url))
    .replace(/\b(?:Bearer|Basic)\s+[a-zA-Z0-9+/=._-]+/gi, '[Filtered]')
    .replace(/\b(?:password|passwd|token|secret|authorization|cookie|api[_-]?key)\s*[:=]\s*[^\s,;]+/gi, '[Filtered]')
    .replace(/[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g, '[Filtered]')
    .replace(/(?:\+?\d[\s()-]*){10,}/g, '[Filtered]')
    .slice(0, 1000);
}

// Keep useful locations/status codes, never console messages, clicks or payloads.
export function sanitizeBreadcrumb(breadcrumb: Breadcrumb): Breadcrumb | null {
  const data = breadcrumb.data || {};
  if (breadcrumb.type === 'http') {
    return {
      type: 'http', category: breadcrumb.category, timestamp: breadcrumb.timestamp,
      data: {
        ...(typeof data.url === 'string' ? { url: safeUrl(data.url) } : {}),
        ...(/^(GET|POST|PUT|PATCH|DELETE|HEAD|OPTIONS)$/.test(data.method) ? { method: data.method } : {}),
        ...(typeof data.status_code === 'number' ? { status_code: data.status_code } : {}),
      },
    };
  }
  if (breadcrumb.category === 'navigation') {
    return {
      category: 'navigation', timestamp: breadcrumb.timestamp,
      data: {
        ...(typeof data.from === 'string' ? { from: safeUrl(data.from) } : {}),
        ...(typeof data.to === 'string' ? { to: safeUrl(data.to) } : {}),
      },
    };
  }
  return null;
}

export function sanitizeErrorEvent(event: ErrorEvent, hint?: EventHint): ErrorEvent {
  // Use an allowlist: SDK integrations may attach new request/user fields later.
  if (hint) hint.attachments = [];
  return {
    type: undefined,
    event_id: event.event_id, timestamp: event.timestamp, level: event.level,
    platform: event.platform, release: event.release, dist: event.dist,
    environment: event.environment, sdk: event.sdk,
    debug_meta: event.debug_meta ? {
      images: event.debug_meta.images?.map((image) => ({
        ...image, ...(image.code_file ? { code_file: safeUrl(image.code_file) } : {}),
      })),
    } : undefined,
    ...(event.message ? { message: safeText(event.message) } : {}),
    ...(event.logentry ? { logentry: { message: safeText(event.logentry.message || '') } } : {}),
    ...(event.request?.url ? { request: { url: safeUrl(event.request.url) } } : {}),
    ...(event.transaction ? { transaction: safeText(event.transaction).split(/[?#]/)[0] } : {}),
    ...(event.exception ? { exception: {
      values: event.exception.values?.map((exception) => ({
        type: exception.type ? safeText(exception.type) : undefined,
        value: exception.value ? safeText(exception.value) : undefined,
        mechanism: exception.mechanism ? {
          type: exception.mechanism.type, handled: exception.mechanism.handled,
        } : undefined,
        stacktrace: exception.stacktrace ? {
          frames: exception.stacktrace.frames?.map((frame) => ({
            filename: frame.filename ? safeUrl(frame.filename) : undefined,
            abs_path: frame.abs_path ? safeUrl(frame.abs_path) : undefined,
            function: frame.function, module: frame.module,
            lineno: frame.lineno, colno: frame.colno, in_app: frame.in_app, debug_id: frame.debug_id,
          })),
        } : undefined,
      })),
    } } : {}),
    breadcrumbs: event.breadcrumbs?.map(sanitizeBreadcrumb).filter((item): item is Breadcrumb => item !== null),
  };
}

export function errorMonitoringOptions(dsn: string) {
  return {
    dsn,
    environment: process.env.NODE_ENV === 'production' ? 'production' : 'development',
    // SDK 11 collection policy; beforeSend remains a second output boundary.
    dataCollection: {
      userInfo: false,
      cookies: false,
      httpHeaders: false,
      httpBodies: [],
      urlQueryParams: false,
      graphQL: { document: false, variables: false },
      genAI: { inputs: false, outputs: false },
      databaseQueryData: false,
      queues: false,
      stackFrameVariables: false,
      frameContextLines: 0,
    },
    sendClientReports: false,
    beforeSendLog: () => null,
    beforeSendMetric: () => null,
    tracesSampleRate: 0,
    tracePropagationTargets: [],
    integrations: <T extends { name: string }>(defaults: T[]) => defaults.filter((integration) =>
      !['BrowserSession', 'ProcessSession', 'BrowserTracing', 'Replay', 'ConversationId', 'Console'].includes(integration.name)),
    replaysSessionSampleRate: 0,
    replaysOnErrorSampleRate: 0,
    debug: false,
    beforeSend: sanitizeErrorEvent,
    beforeBreadcrumb: sanitizeBreadcrumb,
  } satisfies BrowserOptions;
}
