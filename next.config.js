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
    'https://*.sentry.io',
    'https://*.ingest.sentry.io',
  ]
    .filter(Boolean)
    .join(' '),
  "style-src 'self' 'unsafe-inline'",
  "img-src 'self' data: blob: https:",
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
    'https://*.sentry.io',
    'https://*.ingest.sentry.io',
    'wss:',
  ].join(' '),
  "media-src 'self' data: blob:",
  "object-src 'none'",
  "base-uri 'self'",
  "form-action 'self'",
  "frame-src 'self' https://yookassa.ru https://*.yookassa.ru https://yoomoney.ru https://*.yoomoney.ru",
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
  images: {
    localPatterns: [
      {
        pathname: '/**',
      },
    ],
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

// Injected content via Sentry wizard below

const { withSentryConfig } = require('@sentry/nextjs');

module.exports = withSentryConfig(nextConfig, {
  // For all available options, see:
  // https://docs.sentry.io/platforms/javascript/guides/nextjs/configuration/build/

  org: 'mister-jaco-llc',
  project: 'driver_site',

  // Only print logs for uploading source maps in CI
  silent: !process.env.CI,

  // Upload a larger set of source maps for prettier stack traces (increases build time)
  widenClientFileUpload: true,

  // Automatically annotate React components to show their full name in breadcrumbs and session replay
  reactComponentAnnotation: {
    enabled: true,
  },

  // Route browser requests to Sentry through a Next.js rewrite to circumvent ad-blockers.
  // This can increase your server load as well as your hosting bill.
  // Note: Check that the configured route will not match with your Next.js middleware, otherwise reporting of client-
  // side errors will fail.
  tunnelRoute: '/monitoring',

  // Automatically tree-shake Sentry logger statements to reduce bundle size
  disableLogger: true,

  // Enables automatic instrumentation of Vercel Cron Monitors. (Does not yet work with App Router route handlers.)
  // See the following for more information:
  // https://docs.sentry.io/product/crons/
  // https://vercel.com/docs/cron-jobs
  automaticVercelMonitors: true,
});
