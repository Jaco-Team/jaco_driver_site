const isDev = process.env.NODE_ENV !== 'production';

function getOrigin(value) {
  if (!value) {
    return null;
  }

  try {
    return new URL(value).origin;
  } catch {
    return null;
  }
}

function unique(values) {
  return [...new Set(values.filter(Boolean))];
}

const apiOrigins = unique([
  getOrigin(process.env.NEXT_PUBLIC_API_ORIGIN),
  getOrigin(process.env.NEXT_PUBLIC_API_URL),
  getOrigin(process.env.NEXT_PUBLIC_LEGACY_API_ORIGIN),
  getOrigin(process.env.NEXT_PUBLIC_MEDIA_ORIGIN),
]);

const apiProxyTarget =
  getOrigin(process.env.NEXT_PUBLIC_API_ORIGIN) || getOrigin(process.env.NEXT_PUBLIC_API_URL);
const isApiProxyEnabled =
  ['1', 'true', 'yes'].includes(
    `${process.env.NEXT_PUBLIC_API_PROXY || ''}`.trim().toLowerCase()
  ) && Boolean(apiProxyTarget);

const cspDirectives = [
  "default-src 'self'",
  [
    'script-src',
    "'self'",
    "'unsafe-inline'",
    isDev ? "'unsafe-eval'" : '',
    'https://api-maps.yandex.ru',
    'https://*.maps.yandex.net',
    'https://mc.yandex.ru',
    'https://yastatic.net',
    'https://yookassa.ru',
    'https://*.yookassa.ru',
    'https://yoomoney.ru',
    'https://*.yoomoney.ru',
    'https://www.gstatic.com',
    'https://smartcaptcha.yandexcloud.net',
    'https://*.smartcaptcha.yandexcloud.net',
    'https://smartcaptcha.cloud.yandex.ru',
  ]
    .filter(Boolean)
    .join(' '),
  "style-src 'self' 'unsafe-inline'",
  ['img-src', "'self'", 'data:', 'blob:', 'https:', ...apiOrigins].join(' '),
  "font-src 'self' data:",
  [
    'connect-src',
    "'self'",
    ...apiOrigins,
    'https://api-maps.yandex.ru',
    'https://*.maps.yandex.net',
    'https://mc.yandex.ru',
    'https://*.yandex.ru',
    'https://*.yandex.net',
    'https://yastatic.net',
    'https://yookassa.ru',
    'https://*.yookassa.ru',
    'https://yoomoney.ru',
    'https://*.yoomoney.ru',
    'https://qr.nspk.ru',
    'https://www.gstatic.com',
    'https://firebaseinstallations.googleapis.com',
    'https://fcmregistrations.googleapis.com',
    'https://sentry.jacochef.ru',
    'https://smartcaptcha.yandexcloud.net',
    'https://*.smartcaptcha.yandexcloud.net',
    'https://smartcaptcha.cloud.yandex.ru',
    'wss:',
  ].join(' '),
  "media-src 'self' data: blob:",
  "object-src 'none'",
  "base-uri 'self'",
  "form-action 'self'",
  "frame-src 'self' https://yookassa.ru https://*.yookassa.ru https://yoomoney.ru https://*.yoomoney.ru https://smartcaptcha.yandexcloud.net https://*.smartcaptcha.yandexcloud.net https://smartcaptcha.cloud.yandex.ru",
  "frame-ancestors 'none'",
  "worker-src 'self' blob:",
];

const securityHeaders = [
  {
    key: 'Content-Security-Policy',
    value: cspDirectives.join('; '),
  },
  {
    key: 'Referrer-Policy',
    value: 'strict-origin-when-cross-origin',
  },
  {
    key: 'X-Content-Type-Options',
    value: 'nosniff',
  },
  {
    key: 'X-Frame-Options',
    value: 'DENY',
  },
  {
    key: 'Permissions-Policy',
    value: 'camera=(), microphone=(), geolocation=(self), payment=(self "https://yookassa.ru")',
  },
];

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  output: 'standalone',
  distDir: process.env.NEXT_DIST_DIR || '.next',
  images: {
    localPatterns: [
      {
        pathname: '/**',
      },
    ],
  },
  async rewrites() {
    if (!isApiProxyEnabled) {
      return [];
    }

    return [
      {
        source: '/api/v1/:path*',
        destination: `${apiProxyTarget}/api/v1/:path*`,
      },
    ];
  },
  async redirects() {
    return [
      {
        source: '/',
        destination: '/list_orders',
        permanent: false,
      },
    ];
  },
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: securityHeaders,
      },
    ];
  },
};

const { withSentryConfig } = require('@sentry/nextjs/config');
const { selfHostedDsn } = require('./shared/lib/monitoring/sentry-dsn');
const sentryRelease = process.env.SENTRY_RELEASE;
const sentryCommit = sentryRelease?.match(/^jaco-driver-frontend@([a-f0-9]{40})$/)?.[1];
const uploadSourcemaps = process.env.SENTRY_UPLOAD_SOURCEMAPS === '1';
// Repository association is optional; debug-id symbolication does not need GitHub.
const associateCommits = process.env.SENTRY_SET_COMMITS === '1';
if (uploadSourcemaps && (!process.env.SENTRY_AUTH_TOKEN || !sentryCommit)) {
  throw new Error('SENTRY_BUILD_CREDENTIAL_OR_RELEASE_MISSING');
}
if (uploadSourcemaps && !selfHostedDsn(process.env.NEXT_PUBLIC_SENTRY_DSN)) {
  throw new Error('SENTRY_BUILD_PUBLIC_DSN_INVALID');
}

module.exports = withSentryConfig(nextConfig, {
  sentryUrl: 'https://sentry.jacochef.ru/',
  org: process.env.SENTRY_ORG || 'sentry',
  project: process.env.SENTRY_PROJECT || 'javascript-react',
  telemetry: false,
  silent: true,
  debug: false,
  widenClientFileUpload: true,
  sourcemaps: {
    disable: !uploadSourcemaps,
    deleteSourcemapsAfterUpload: true,
  },
  release: {
    name: sentryRelease,
    create: uploadSourcemaps,
    finalize: uploadSourcemaps,
    setCommits: uploadSourcemaps && associateCommits ? {
      repo: 'Jaco-Team/jaco_driver_site', commit: sentryCommit,
    } : false,
    deploy: false,
  },
  bundleSizeOptimizations: { excludeDebugStatements: true, excludeTracing: true },
  errorHandler: () => { throw new Error('SENTRY_RELEASE_OR_SOURCEMAP_UPLOAD_FAILED'); },
});
