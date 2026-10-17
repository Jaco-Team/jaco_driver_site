// @vitest-environment node
import { spawnSync } from 'node:child_process';
import { mkdtemp, readFile, rm, writeFile } from 'node:fs/promises';
import { createRequire } from 'node:module';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { runOfflinePreview } from './preview-offline.mjs';

const projectRoot = '/repo';
const npmCli = '/runtime/npm-cli.js';
const envFixtureRoots = [];
const require = createRequire(import.meta.url);
const nextEnvPath = createRequire(require.resolve('next/package.json')).resolve('@next/env');

function setup(env = {}) {
  const combinedEnv = {
    NEXT_PUBLIC_API_ORIGIN: 'http://localhost:8080',
    NEXT_PUBLIC_API_PROXY: 'true',
    ...env,
  };
  const loadEnv = vi.fn(() => ({ combinedEnv }));
  const run = vi.fn(() => ({ status: 0, signal: null }));
  const launch = () => runOfflinePreview({ projectRoot, loadEnv, run });
  return { combinedEnv, loadEnv, run, launch };
}

beforeEach(() => {
  vi.stubEnv('NODE_ENV', 'development');
  vi.stubEnv('npm_execpath', npmCli);
});

afterEach(async () => {
  vi.unstubAllEnvs();
  vi.restoreAllMocks();
  await Promise.all(envFixtureRoots.splice(0).map((root) => rm(root, { recursive: true })));
});

describe('offline preview launcher', () => {
  it('loads development settings in production mode and shares the env between both stages', () => {
    const { combinedEnv, loadEnv, run, launch } = setup();
    vi.stubEnv('NODE_ENV', 'test');
    loadEnv.mockImplementation(() => {
      expect(process.env.NODE_ENV).toBe('production');
      return { combinedEnv };
    });

    expect(launch()).toBe(0);
    expect(loadEnv).toHaveBeenCalledWith(projectRoot, true);
    expect(run).toHaveBeenCalledTimes(2);
    const options = {
      cwd: projectRoot,
      stdio: 'inherit',
      env: {
        ...combinedEnv,
        NODE_ENV: 'production',
        NEXT_DIST_DIR: '.next-preview',
        __NEXT_PROCESSED_ENV: 'true',
      },
    };
    expect(run).toHaveBeenNthCalledWith(1, process.execPath, [npmCli, 'run', 'build'], options);
    expect(run).toHaveBeenNthCalledWith(
      2,
      process.execPath,
      [npmCli, 'run', 'start:standalone'],
      options
    );
    expect(run.mock.calls[0][2].env).toBe(run.mock.calls[1][2].env);
  });

  it('accepts API_URL as a fallback and preserves explicit env overrides', () => {
    const { run, launch } = setup({
      NEXT_PUBLIC_API_ORIGIN: '   ',
      NEXT_PUBLIC_API_URL: ' http://localhost:8080 ',
      NEXT_PUBLIC_ENABLE_SW: '0',
      PORT: '3325',
      NODE_ENV: 'development',
      NEXT_DIST_DIR: '.next',
    });

    expect(launch()).toBe(0);
    expect(run.mock.calls[0][2].env).toMatchObject({
      NEXT_PUBLIC_API_ORIGIN: 'http://localhost:8080',
      NEXT_PUBLIC_ENABLE_SW: '0',
      PORT: '3325',
      NODE_ENV: 'production',
      NEXT_DIST_DIR: '.next-preview',
    });
  });

  it('rejects missing, malformed and non-HTTP API settings before starting a process', () => {
    for (const origin of [undefined, '', 'not-a-url', 'file:///tmp/api']) {
      const { run, launch } = setup({
        NEXT_PUBLIC_API_ORIGIN: origin,
        NEXT_PUBLIC_API_URL: undefined,
      });
      expect(launch).toThrow();
      expect(run).not.toHaveBeenCalled();
    }
  });

  it('rejects a missing npm executable before starting a process', () => {
    vi.stubEnv('npm_execpath', undefined);
    const { run, launch } = setup();
    expect(launch).toThrow('npm run preview:offline');
    expect(run).not.toHaveBeenCalled();
  });

  it('does not start the server after an unsuccessful or indeterminate build', () => {
    for (const status of [2, null]) {
      const { run, launch } = setup();
      run.mockReturnValueOnce({ status, signal: null });
      expect(launch()).toBe(status ?? 1);
      expect(run).toHaveBeenCalledTimes(1);
    }
  });

  it('returns the standalone server failure status', () => {
    const { run, launch } = setup();
    run.mockReturnValueOnce({ status: 0, signal: null });
    run.mockReturnValueOnce({ status: 7, signal: null });
    expect(launch()).toBe(7);
    expect(run).toHaveBeenCalledTimes(2);
  });

  it('preserves signal exit codes without continuing after an interrupted build', () => {
    for (const [signal, expected] of [
      ['SIGINT', 130],
      ['SIGTERM', 143],
    ]) {
      const { run, launch } = setup();
      run.mockReturnValueOnce({ status: null, signal });
      expect(launch()).toBe(expected);
      expect(run).toHaveBeenCalledTimes(1);
    }
  });

  it('surfaces process launch errors without continuing', () => {
    const { run, launch } = setup();
    const error = new Error('Unable to spawn npm');
    run.mockReturnValueOnce({ status: null, signal: null, error });
    expect(launch).toThrow(error);
    expect(run).toHaveBeenCalledTimes(1);
  });
});

async function launchWithRealEnv(files, overrides = {}, { probeProductionEnv = false } = {}) {
  const root = await mkdtemp(join(tmpdir(), 'jaco-preview-env-'));
  envFixtureRoots.push(root);
  await Promise.all(
    Object.entries(files).map(([name, contents]) => writeFile(join(root, name), contents))
  );
  // A fresh process isolates @next/env's module cache and reads only synthetic env fixtures.
  // The real launcher/loader run, but neither npm, a build nor a server is started.
  const productionProbe = `
    const { loadEnvConfig } = require(${JSON.stringify(nextEnvPath)});
    const { combinedEnv } = loadEnvConfig(process.cwd(), false);
    const keys = ['NEXT_PUBLIC_API_ORIGIN', 'NEXT_PUBLIC_PRODUCTION_ONLY', 'NEXT_PUBLIC_TEST_ONLY',
      'NODE_ENV', 'NEXT_DIST_DIR', '__NEXT_PROCESSED_ENV'];
    console.log(JSON.stringify(Object.fromEntries(keys.map(key => [key, combinedEnv[key]]))));
  `;
  const source = `
    import { spawnSync } from 'node:child_process';
    import { runOfflinePreview } from ${JSON.stringify(new URL('./preview-offline.mjs', import.meta.url).href)};
    const keys = ['NEXT_PUBLIC_API_ORIGIN', 'NEXT_PUBLIC_API_URL', 'NEXT_PUBLIC_MEDIA_ORIGIN',
      'NEXT_PUBLIC_API_PROXY', 'NEXT_PUBLIC_PRODUCTION_ONLY', 'NEXT_PUBLIC_TEST_ONLY',
      'PORT', 'NODE_ENV', 'NEXT_DIST_DIR', '__NEXT_PROCESSED_ENV'];
    const stages = [];
    try {
      const status = runOfflinePreview({
        run(_node, args, options) {
          const stage = { script: args.at(-1), env: Object.fromEntries(keys.map(key => [key, options.env[key]])) };
          if (${probeProductionEnv}) {
            const probe = spawnSync(process.execPath, ['-e', ${JSON.stringify(productionProbe)}], {
              cwd: options.cwd, env: options.env, encoding: 'utf8', timeout: 10_000,
            });
            if (probe.error || probe.status !== 0) throw probe.error || new Error(probe.stderr);
            stage.productionEnv = JSON.parse(probe.stdout);
          }
          stages.push(stage);
          return { status: 0, signal: null };
        },
      });
      console.log(JSON.stringify({ status, stages }));
    } catch (error) {
      console.log(JSON.stringify({ error: error.message, stages }));
    }
  `;
  const result = spawnSync(process.execPath, ['--input-type=module', '-e', source], {
    cwd: root,
    env: { NODE_ENV: 'test', npm_execpath: npmCli, ...overrides },
    encoding: 'utf8',
    timeout: 10_000,
  });
  expect(result.error).toBeUndefined();
  expect(result.status, result.stderr).toBe(0);
  for (const [name, contents] of Object.entries(files)) {
    expect(await readFile(join(root, name), 'utf8')).toBe(contents);
  }
  return JSON.parse(result.stdout);
}

describe('offline preview with the real Next.js env loader', () => {
  const files = {
    '.env': 'NEXT_PUBLIC_API_ORIGIN=http://base.example.test:8080\n',
    '.env.development': 'NEXT_PUBLIC_API_ORIGIN=http://development.example.test:8080\n',
    '.env.local': 'NEXT_PUBLIC_API_ORIGIN=http://local.example.test:8080\n',
    '.env.development.local': [
      'NEXT_PUBLIC_API_ORIGIN=http://localhost:8080',
      'NEXT_PUBLIC_MEDIA_ORIGIN=http://localhost:8081',
      'NEXT_PUBLIC_API_PROXY=true',
    ].join('\n'),
    '.env.production': [
      'NEXT_PUBLIC_API_ORIGIN=https://production.example.test',
      'NEXT_PUBLIC_PRODUCTION_ONLY=must-not-load',
    ].join('\n'),
    '.env.production.local': 'NEXT_PUBLIC_PRODUCTION_ONLY=must-not-load-either\n',
    '.env.test': 'NEXT_PUBLIC_TEST_ONLY=must-not-load\n',
  };

  it('loads development.local despite the initial test environment and keeps production SW mode', async () => {
    const result = await launchWithRealEnv(files);
    expect(result.status).toBe(0);
    expect(result.stages.map(({ script }) => script)).toEqual(['build', 'start:standalone']);
    const expected = {
      NEXT_PUBLIC_API_ORIGIN: 'http://localhost:8080',
      NEXT_PUBLIC_MEDIA_ORIGIN: 'http://localhost:8081',
      NEXT_PUBLIC_API_PROXY: 'true',
      NODE_ENV: 'production',
      NEXT_DIST_DIR: '.next-preview',
      __NEXT_PROCESSED_ENV: 'true',
    };
    expect(result.stages[0].env).toEqual(expected);
    expect(result.stages[1].env).toEqual(expected);
  });

  it.each([
    [['.env.development.local'], 'http://local.example.test:8080'],
    [['.env.development.local', '.env.local'], 'http://development.example.test:8080'],
    [['.env.development.local', '.env.local', '.env.development'], 'http://base.example.test:8080'],
  ])('respects the Next.js fallback order without %j', async (excluded, expectedOrigin) => {
    const fixtureFiles = Object.fromEntries(
      Object.entries(files).filter(([name]) => !excluded.includes(name))
    );
    const result = await launchWithRealEnv(fixtureFiles);
    expect(result.status).toBe(0);
    for (const stage of result.stages) {
      expect(stage.env.NEXT_PUBLIC_API_ORIGIN).toBe(expectedOrigin);
      expect(stage.env).not.toHaveProperty('NEXT_PUBLIC_PRODUCTION_ONLY');
      expect(stage.env).not.toHaveProperty('NEXT_PUBLIC_TEST_ONLY');
    }
  });

  it('preserves explicit command-line API, proxy and port overrides for both stages', async () => {
    const result = await launchWithRealEnv(files, {
      NEXT_PUBLIC_API_ORIGIN: 'http://127.0.0.1:9080',
      NEXT_PUBLIC_API_PROXY: 'false',
      PORT: '3325',
    });
    expect(result.status).toBe(0);
    for (const stage of result.stages) {
      expect(stage.env).toMatchObject({
        NEXT_PUBLIC_API_ORIGIN: 'http://127.0.0.1:9080',
        NEXT_PUBLIC_API_PROXY: 'false',
        PORT: '3325',
        NODE_ENV: 'production',
      });
    }
  });

  it('prevents a real production-mode loader in either child from merging production env files', async () => {
    const result = await launchWithRealEnv(files, {}, { probeProductionEnv: true });
    expect(result.status).toBe(0);
    expect(result.stages).toHaveLength(2);
    for (const stage of result.stages) {
      expect(stage.productionEnv).toEqual({
        NEXT_PUBLIC_API_ORIGIN: 'http://localhost:8080',
        NODE_ENV: 'production',
        NEXT_DIST_DIR: '.next-preview',
        __NEXT_PROCESSED_ENV: 'true',
      });
    }
  });

  it('normalizes an API_URL-only fixture without taking an origin from production files', async () => {
    const result = await launchWithRealEnv({
      '.env.development.local': 'NEXT_PUBLIC_API_URL=http://localhost:8080\n',
      '.env.production.local': files['.env.production'],
    });
    expect(result.status).toBe(0);
    for (const stage of result.stages) {
      expect(stage.env.NEXT_PUBLIC_API_ORIGIN).toBe('http://localhost:8080');
      expect(stage.env.NEXT_PUBLIC_API_URL).toBe('http://localhost:8080');
      expect(stage.env).not.toHaveProperty('NEXT_PUBLIC_PRODUCTION_ONLY');
    }
  });

  it('rejects production-only API settings before attempting any build or server', async () => {
    const result = await launchWithRealEnv({
      '.env.production': files['.env.production'],
      '.env.production.local': files['.env.production.local'],
    });
    expect(result.error).toContain('.env.development.local');
    expect(result.stages).toEqual([]);
  });
});
