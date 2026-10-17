// @vitest-environment node
import { readFileSync } from 'node:fs';
import { runInNewContext } from 'node:vm';
import { describe, expect, it } from 'vitest';

const source = readFileSync(new URL('../../next.config.js', import.meta.url), 'utf8');
function load(env = {}) {
  let options;
  const configModule = { exports: {} };
  runInNewContext(source, {
    module: configModule, URL, process: { env: { NODE_ENV: 'production', ...env } },
    require(name) {
      if (name !== '@sentry/nextjs/config') throw new Error('Unexpected import');
      return { withSentryConfig(config, sentryOptions) { options = sentryOptions; return config; } };
    },
  });
  return { config: configModule.exports, options };
}

describe('self-hosted release publication boundary', () => {
  it('only permits the exact own ingestion origin and adds no public tunnel', async () => {
    const { config, options } = load();
    const csp = (await config.headers())[0].headers.find(({ key }) => key === 'Content-Security-Policy').value;
    const directives = Object.fromEntries(csp.split('; ').map((part) => {
      const [name, ...sources] = part.split(' '); return [name, sources];
    }));
    expect(directives['connect-src']).toContain('https://sentry.jacochef.ru');
    expect(directives['script-src']).not.toContain('https://sentry.jacochef.ru');
    expect(csp).not.toMatch(/sentry\.io|\*\.sentry/);
    expect(options.sentryUrl).toBe('https://sentry.jacochef.ru/');
    expect(options.telemetry).toBe(false);
    expect(options).not.toHaveProperty('tunnelRoute');
    expect(await config.rewrites()).toEqual([]);
  });

  it('requires both credential and full source commit before uploading', () => {
    expect(() => load({ SENTRY_UPLOAD_SOURCEMAPS: '1' })).toThrow('SENTRY_BUILD_CREDENTIAL_OR_RELEASE_MISSING');
    expect(() => load({ SENTRY_UPLOAD_SOURCEMAPS: '1', SENTRY_AUTH_TOKEN: 'synthetic', SENTRY_RELEASE: 'bad' }))
      .toThrow('SENTRY_BUILD_CREDENTIAL_OR_RELEASE_MISSING');
  });

  it('optionally associates the build with the exact repository commit without claiming a deployment', () => {
    const commit = 'a'.repeat(40);
    const { options } = load({ SENTRY_UPLOAD_SOURCEMAPS: '1', SENTRY_AUTH_TOKEN: 'synthetic',
      SENTRY_RELEASE: `jaco-driver-frontend@${commit}`, SENTRY_SET_COMMITS: '1', SENTRY_ORG: 'own-org', SENTRY_PROJECT: 'own-project' });
    expect(options.release).toMatchObject({ name: `jaco-driver-frontend@${commit}`, create: true,
      finalize: true, setCommits: { repo: 'Jaco-Team/jaco_driver_site', commit }, deploy: false });
    expect(options.org).toBe('own-org');
    expect(options.project).toBe('own-project');
    expect(options.sourcemaps).toMatchObject({ disable: false, deleteSourcemapsAfterUpload: true });
    expect(options).not.toHaveProperty('authToken');
    expect(() => options.errorHandler(new Error('raw private detail'))).toThrow('SENTRY_RELEASE_OR_SOURCEMAP_UPLOAD_FAILED');
  });

  it('uploads debug-id sourcemaps and creates releases without a GitHub integration', () => {
    const { options } = load({ SENTRY_UPLOAD_SOURCEMAPS: '1', SENTRY_AUTH_TOKEN: 'synthetic',
      SENTRY_RELEASE: `jaco-driver-frontend@${'a'.repeat(40)}` });
    expect(options.sourcemaps.disable).toBe(false);
    expect(options.release).toMatchObject({ create: true, finalize: true, setCommits: false, deploy: false });
  });

  it('does not upload or create releases during an ordinary local build', () => {
    const { options } = load();
    expect(options.sourcemaps.disable).toBe(true);
    expect(options.release).toMatchObject({ create: false, finalize: false, setCommits: false, deploy: false });
  });
});
