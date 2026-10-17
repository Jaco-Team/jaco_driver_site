// @vitest-environment node
import { readFileSync } from 'node:fs';
import { runInNewContext } from 'node:vm';
import { afterEach, describe, expect, it, vi } from 'vitest';

const source = readFileSync(new URL('../../next.config.js', import.meta.url), 'utf8');
const envNames = [
  'NODE_ENV',
  'NEXT_DIST_DIR',
  'NEXT_PUBLIC_API_ORIGIN',
  'NEXT_PUBLIC_API_URL',
  'NEXT_PUBLIC_LEGACY_API_ORIGIN',
  'NEXT_PUBLIC_MEDIA_ORIGIN',
  'NEXT_PUBLIC_API_PROXY',
];

afterEach(() => {
  vi.unstubAllEnvs();
  vi.resetModules();
});

async function loadContract(overrides = {}) {
  const env = {
    NODE_ENV: 'production',
    NEXT_PUBLIC_API_ORIGIN: 'http://localhost:8080',
    ...overrides,
  };
  for (const name of envNames) vi.stubEnv(name, env[name]);
  vi.resetModules();
  const { apiConfig } = await import('../../shared/api/config');
  const configModule = { exports: {} };
  runInNewContext(source, {
    module: configModule,
    URL,
    process: { env },
    require(name) {
      // Only Sentry's build wrapper is removed. CSP, headers and rewrites execute
      // from the real config; no SDK, env file or network is involved.
      if (name !== '@sentry/nextjs/config') throw new Error(`Unexpected import: ${name}`);
      return { withSentryConfig: (config) => config };
    },
  });
  const config = configModule.exports;
  const headerRules = await config.headers();
  const headers = Object.fromEntries(
    headerRules
      .find(({ source: pattern }) => pattern === '/(.*)')
      .headers.map(({ key, value }) => [key, value])
  );
  const csp = Object.fromEntries(
    headers['Content-Security-Policy'].split(';').map((directive) => {
      const [name, ...values] = directive.trim().split(/\s+/);
      return [name, values];
    })
  );
  return { apiConfig, config, csp, headers, rewrites: await config.rewrites() };
}

describe('explicit API env agrees with the real client and Next.js security config', () => {
  it.each(['http://localhost:8080/', 'http://127.0.0.1:8080///'])(
    'allows the same direct local API selected by the client: %s',
    async (origin) => {
      const { apiConfig, csp, rewrites } = await loadContract({ NEXT_PUBLIC_API_ORIGIN: origin });
      expect(apiConfig.apiOrigin).toBe(new URL(origin).origin);
      expect(apiConfig.apiBaseUrl).toBe(apiConfig.apiOrigin);
      expect(apiConfig.sessionTimeoutMs).toBe(45_000);
      expect(csp['connect-src']).toContain(apiConfig.apiOrigin);
      expect(csp['connect-src']).toContain("'self'");
      expect(rewrites).toEqual([]);
    }
  );

  it.each(['1', 'true', 'yes', ' TRUE '])(
    'uses a same-origin browser request and the matching local rewrite for proxy=%j',
    async (flag) => {
      const { apiConfig, csp, rewrites } = await loadContract({ NEXT_PUBLIC_API_PROXY: flag });
      expect(apiConfig.isApiProxyEnabled).toBe(true);
      expect(apiConfig.apiBaseUrl).toBe('');
      const request = new URL(`${apiConfig.apiBaseUrl}/api/v1/auth/login`, 'http://localhost:3225');
      expect(request.origin).toBe('http://localhost:3225');
      expect(csp['connect-src']).toContain("'self'");
      expect(rewrites).toEqual([
        { source: '/api/v1/:path*', destination: `${apiConfig.apiOrigin}/api/v1/:path*` },
      ]);
    }
  );

  it.each([undefined, '', '0', 'false', 'no'])(
    'keeps direct API mode and disables rewrites for proxy=%j',
    async (flag) => {
      const { apiConfig, csp, rewrites } = await loadContract({ NEXT_PUBLIC_API_PROXY: flag });
      expect(apiConfig.isApiProxyEnabled).toBe(false);
      expect(apiConfig.apiBaseUrl).toBe('http://localhost:8080');
      expect(csp['connect-src']).toContain(apiConfig.apiBaseUrl);
      expect(rewrites).toEqual([]);
    }
  );

  it('uses API_URL consistently when the primary origin is blank', async () => {
    const { apiConfig, csp, rewrites } = await loadContract({
      NEXT_PUBLIC_API_ORIGIN: '  ',
      NEXT_PUBLIC_API_URL: ' http://127.0.0.1:9080/ ',
      NEXT_PUBLIC_API_PROXY: 'true',
    });
    expect(apiConfig.apiOrigin).toBe('http://127.0.0.1:9080');
    expect(csp['connect-src']).toContain(apiConfig.apiOrigin);
    expect(rewrites).toEqual([
      { source: '/api/v1/:path*', destination: 'http://127.0.0.1:9080/api/v1/:path*' },
    ]);
  });

  it('prefers the explicit primary origin over API_URL in both client and proxy', async () => {
    const { apiConfig, csp, rewrites } = await loadContract({
      NEXT_PUBLIC_API_ORIGIN: 'http://localhost:8080/',
      NEXT_PUBLIC_API_URL: 'https://fallback.example.test/',
      NEXT_PUBLIC_API_PROXY: 'yes',
    });
    expect(apiConfig.apiOrigin).toBe('http://localhost:8080');
    expect(csp['connect-src']).toContain('http://localhost:8080');
    expect(rewrites[0].destination).toBe('http://localhost:8080/api/v1/:path*');
  });

  it('allows an explicitly configured HTTPS API without a local development timeout', async () => {
    const { apiConfig, csp, rewrites } = await loadContract({
      NEXT_PUBLIC_API_ORIGIN: 'https://api.example.test/',
    });
    expect(apiConfig.apiOrigin).toBe('https://api.example.test');
    expect(apiConfig.sessionTimeoutMs).toBe(15_000);
    expect(csp['connect-src']).toContain(apiConfig.apiOrigin);
    expect(rewrites).toEqual([]);
  });

  it('permits explicit media/legacy origins without broadening the CSP allowlist', async () => {
    const { apiConfig, csp } = await loadContract({
      NEXT_PUBLIC_MEDIA_ORIGIN: 'https://media.example.test/',
      NEXT_PUBLIC_LEGACY_API_ORIGIN: 'https://legacy.example.test/path',
    });
    expect(apiConfig.mediaOrigin).toBe('https://media.example.test');
    expect(csp['connect-src']).toContain('https://media.example.test');
    expect(csp['connect-src']).toContain('https://legacy.example.test');
    expect(csp['img-src']).toContain('https://media.example.test');
    expect(csp['connect-src']).not.toContain('*');
    expect(csp['connect-src']).not.toContain('http:');
    expect(csp['connect-src']).not.toContain('https:');
    expect(csp['connect-src']).not.toContain('https://unconfigured.example.test');
  });

  it('deduplicates origins and excludes malformed optional env values from CSP', async () => {
    const { csp } = await loadContract({
      NEXT_PUBLIC_API_URL: 'http://localhost:8080/',
      NEXT_PUBLIC_LEGACY_API_ORIGIN: 'not-an-origin',
      NEXT_PUBLIC_MEDIA_ORIGIN: 'http://localhost:8080/',
    });
    expect(csp['connect-src'].filter((value) => value === 'http://localhost:8080')).toHaveLength(1);
    expect(csp['connect-src']).not.toContain('not-an-origin');
    expect(csp['connect-src']).not.toContain('null');
  });

  it('retains production security headers in local offline-preview mode', async () => {
    const { config, apiConfig, csp, headers } = await loadContract({
      NEXT_DIST_DIR: '.next-preview',
      NEXT_PUBLIC_API_PROXY: 'true',
    });
    expect(config.distDir).toBe('.next-preview');
    expect(config.output).toBe('standalone');
    expect(apiConfig.isDevelopment).toBe(false);
    expect(csp['script-src']).not.toContain("'unsafe-eval'");
    expect(csp['default-src']).toEqual(["'self'"]);
    expect(csp['object-src']).toEqual(["'none'"]);
    expect(csp['frame-ancestors']).toEqual(["'none'"]);
    expect(csp['worker-src']).toEqual(["'self'", 'blob:']);
    expect(headers['X-Frame-Options']).toBe('DENY');
    expect(headers['X-Content-Type-Options']).toBe('nosniff');
    expect(headers['Referrer-Policy']).toBe('strict-origin-when-cross-origin');
  });

  it('keeps development HMR support separate from production preview settings', async () => {
    const { config, apiConfig, csp } = await loadContract({ NODE_ENV: 'development' });
    expect(config.distDir).toBe('.next');
    expect(apiConfig.isDevelopment).toBe(true);
    expect(csp['script-src']).toContain("'unsafe-eval'");
    expect(csp['connect-src']).toContain('http://localhost:8080');
  });

  it('preserves the existing root redirect while API requests use rewrites', async () => {
    const { config } = await loadContract();
    expect(await config.redirects()).toEqual([
      { source: '/', destination: '/list_orders', permanent: false },
    ]);
  });
});
