// @vitest-environment node
import { spawnSync } from 'node:child_process';
import { mkdtemp, mkdir, readFile, readdir, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { afterEach, describe, expect, it } from 'vitest';

const launcher = fileURLToPath(new URL('./start-standalone.mjs', import.meta.url));
const roots = [];

afterEach(async () => {
  await Promise.all(roots.splice(0).map((root) => rm(root, { recursive: true })));
});

async function put(root, path, contents) {
  await mkdir(dirname(join(root, path)), { recursive: true });
  await writeFile(join(root, path), contents);
}

async function readTree(root) {
  const files = [];
  for (const entry of await readdir(root, { withFileTypes: true })) {
    if (entry.isDirectory()) {
      files.push(
        ...(await readTree(join(root, entry.name))).map(([name, contents]) => [
          `${entry.name}/${name}`,
          contents,
        ])
      );
    } else {
      files.push([entry.name, await readFile(join(root, entry.name), 'utf8')]);
    }
  }
  return files.sort(([left], [right]) => left.localeCompare(right));
}

async function fixture(buildDirectory = '.next') {
  const root = await mkdtemp(join(tmpdir(), 'jaco-standalone-'));
  roots.push(root);
  const otherDirectory = buildDirectory === '.next' ? '.next-preview' : '.next';
  const files = {
    'public/sw.js': '/* synthetic service worker */',
    'public/offline-map/runtime/renderer.js': '/* synthetic offline asset */',
    [`${buildDirectory}/static/chunks/app.js`]: '/* synthetic app chunk */',
    [`${buildDirectory}/static/css/app.css`]: '.fixture { color: red; }',
    [`${buildDirectory}/standalone/public/stale.txt`]: 'remove from destination only',
    [`${buildDirectory}/standalone/${buildDirectory}/static/stale.js`]: 'old copied asset',
    [`${otherDirectory}/standalone/public/keep.txt`]: 'do not touch the other build',
    [`${otherDirectory}/static/keep.js`]: 'do not touch the other static assets',
    // The real launcher imports this fake server. It reports env and exits;
    // there is no Next.js runtime, listening socket, backend or network call.
    [`${buildDirectory}/standalone/server.js`]: `console.log(JSON.stringify({
      port: process.env.PORT, hostname: process.env.HOSTNAME
    }));`,
  };
  await Promise.all(Object.entries(files).map(([path, contents]) => put(root, path, contents)));
  const standalone = join(root, buildDirectory, 'standalone');
  const launch = (env = {}) =>
    spawnSync(process.execPath, [launcher], {
      cwd: root,
      env,
      encoding: 'utf8',
      timeout: 10_000,
    });
  return { root, standalone, launch, otherDirectory };
}

describe('standalone launcher using isolated fake build output', () => {
  it.each(['.next', '.next-preview'])(
    'copies current public/static assets for %s without changing source files or the other build',
    async (buildDirectory) => {
      const { root, standalone, launch, otherDirectory } = await fixture(buildDirectory);
      const publicBefore = await readTree(join(root, 'public'));
      const staticBefore = await readTree(join(root, buildDirectory, 'static'));
      const otherBefore = await readTree(join(root, otherDirectory));
      const result = launch({ NEXT_DIST_DIR: buildDirectory });

      expect(result.error).toBeUndefined();
      expect(result.status, result.stderr).toBe(0);
      expect(JSON.parse(result.stdout)).toEqual({ port: '3225', hostname: 'localhost' });
      expect(await readTree(join(standalone, 'public'))).toEqual(publicBefore);
      expect(await readTree(join(standalone, buildDirectory, 'static'))).toEqual(staticBefore);
      expect(await readTree(join(root, 'public'))).toEqual(publicBefore);
      expect(await readTree(join(root, buildDirectory, 'static'))).toEqual(staticBefore);
      expect(await readTree(join(root, otherDirectory))).toEqual(otherBefore);
    }
  );

  it('defaults to .next and preserves an explicit port/hostname instead of replacing them', async () => {
    const { launch } = await fixture();
    const result = launch({ PORT: '3325', HOSTNAME: '127.0.0.1' });
    expect(result.error).toBeUndefined();
    expect(result.status, result.stderr).toBe(0);
    expect(JSON.parse(result.stdout)).toEqual({ port: '3325', hostname: '127.0.0.1' });
  });

  it('uses defaults for explicitly empty port/hostname settings', async () => {
    const { launch } = await fixture();
    const result = launch({ PORT: '', HOSTNAME: '' });
    expect(result.error).toBeUndefined();
    expect(result.status, result.stderr).toBe(0);
    expect(JSON.parse(result.stdout)).toEqual({ port: '3225', hostname: 'localhost' });
  });

  it('refreshes copied assets on another run and removes stale destination files only', async () => {
    const { root, standalone, launch } = await fixture('.next-preview');
    const env = { NEXT_DIST_DIR: '.next-preview' };
    expect(launch(env).status).toBe(0);
    await put(root, 'public/sw.js', '/* updated synthetic worker */');
    await put(root, '.next-preview/static/chunks/app.js', '/* updated chunk */');
    await put(root, '.next-preview/standalone/public/stale-again.txt', 'stale');
    const sourceBefore = await readTree(join(root, 'public'));
    const staticBefore = await readTree(join(root, '.next-preview/static'));
    const result = launch(env);
    expect(result.error).toBeUndefined();
    expect(result.status, result.stderr).toBe(0);
    expect(await readTree(join(standalone, 'public'))).toEqual(sourceBefore);
    expect(await readTree(join(standalone, '.next-preview/static'))).toEqual(staticBefore);
    expect(await readTree(join(root, 'public'))).toEqual(sourceBefore);
    expect(await readTree(join(root, '.next-preview/static'))).toEqual(staticBefore);
  });

  it.each(['.', '..', '../outside', '/unrelated-build', '.next-other'])(
    'rejects unsupported build directory %j before copying or deleting any fixture files',
    async (buildDirectory) => {
      const { root, launch } = await fixture();
      const before = await readTree(root);
      const result = launch({ NEXT_DIST_DIR: buildDirectory });
      expect(result.error).toBeUndefined();
      expect(result.status).not.toBe(0);
      expect(result.stderr).toContain('Unsupported build directory');
      expect(result.stdout).toBe('');
      expect(await readTree(root)).toEqual(before);
    }
  );

  it('fails clearly when the standalone server is missing rather than reporting a ready server', async () => {
    const { root, launch } = await fixture();
    await rm(join(root, '.next/standalone/server.js'));
    const sourceBefore = await readTree(join(root, 'public'));
    const staticBefore = await readTree(join(root, '.next/static'));
    const result = launch();
    expect(result.error).toBeUndefined();
    expect(result.status).not.toBe(0);
    expect(result.stderr).toContain('ERR_MODULE_NOT_FOUND');
    expect(result.stdout).toBe('');
    expect(await readTree(join(root, 'public'))).toEqual(sourceBefore);
    expect(await readTree(join(root, '.next/static'))).toEqual(staticBefore);
  });
});
