// @vitest-environment node
import { mkdtemp, mkdir, readFile, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { dirname, join } from 'node:path';
import { afterEach, describe, expect, it } from 'vitest';
import { syncOfflineMapRuntime } from './sync-offline-map-runtime.mjs';

const roots = [];
afterEach(async () => {
  for (const root of roots.splice(0)) await rm(root, { recursive: true, force: true });
});

async function fixture() {
  const root = await mkdtemp(join(tmpdir(), 'jaco-runtime-'));
  roots.push(root);
  const names = [
    'maplibre-gl.mjs',
    'maplibre-gl-shared.mjs',
    'maplibre-gl-worker.mjs',
    'maplibre-gl.css',
  ];
  const urls = names.map((name) => `/offline-map/runtime/${name}?v=6.11.2`);
  const files = {
    'node_modules/maplibre-gl/package.json': JSON.stringify({ version: '6.12.0' }),
    'node_modules/maplibre-gl/dist/maplibre-gl.mjs':
      '/* BSD license */\nimport "./maplibre-gl-shared.mjs"; const worker = `maplibre-gl-worker.mjs`;\n//# sourceMappingURL=maplibre-gl.mjs.map',
    'node_modules/maplibre-gl/dist/maplibre-gl-worker.mjs':
      'import "./maplibre-gl-shared.mjs";\n//# sourceMappingURL=maplibre-gl-worker.mjs.map',
    'node_modules/maplibre-gl/dist/maplibre-gl-shared.mjs':
      '/* BSD license */\nexport const version = "6.12.0";',
    'node_modules/maplibre-gl/dist/maplibre-gl.css': '.maplibregl-map { position: relative; }',
    'public/offline-map/offline-orders-map.mjs': `import '${urls[0]}';\nglobalThis.JacoOfflineOrdersMap = { version: '26', mount };`,
    'public/sw.js': `const VERSION = 'v40';\nconst PRECACHE = ${JSON.stringify([...urls, '/offline-map/offline-orders-map.mjs?v=26'])};\nconst TILES = 'jaco-yandex-offline-tiles-v1';`,
    'shared/lib/offline/offlineMapAssets.ts': `export const ASSETS = ${JSON.stringify(urls)};`,
    'shared/lib/offline/offlineMapRuntime.ts': "export const OFFLINE_MAP_RUNTIME_VERSION = '26';",
  };
  for (const name of names) files[`public/offline-map/runtime/${name}`] = 'old bundle';
  for (const [path, source] of Object.entries(files)) {
    await mkdir(dirname(join(root, path)), { recursive: true });
    await writeFile(join(root, path), source);
  }
  return { root, files, read: (path) => readFile(join(root, path), 'utf8') };
}

describe('offline MapLibre runtime synchronization', () => {
  it('updates modules, CSS and cache versions without renaming the tile cache', async () => {
    const { root, read } = await fixture();
    await expect(syncOfflineMapRuntime(root)).resolves.toEqual({
      version: '6.12.0',
      changed: true,
    });
    const main = await read('public/offline-map/runtime/maplibre-gl.mjs');
    expect(main).toContain('/* BSD license */');
    expect(main).toContain('./maplibre-gl-shared.mjs?v=6.12.0');
    expect(main).toContain('`maplibre-gl-worker.mjs?v=6.12.0`');
    expect(main).not.toContain('sourceMappingURL');
    expect(await read('public/offline-map/runtime/maplibre-gl-worker.mjs')).toContain(
      './maplibre-gl-shared.mjs?v=6.12.0'
    );
    const worker = await read('public/sw.js');
    expect(worker).toContain("const VERSION = 'v41'");
    expect(worker).toContain('maplibre-gl.css?v=6.12.0');
    expect(worker).toContain('offline-orders-map.mjs?v=27');
    expect(worker).toContain('jaco-yandex-offline-tiles-v1');
    expect(await read('shared/lib/offline/offlineMapRuntime.ts')).toContain("VERSION = '27'");
    expect(await read('public/offline-map/offline-orders-map.mjs')).toContain("version: '27'");
    expect(await read('shared/lib/offline/offlineMapAssets.ts')).not.toContain('6.11.2');
  });

  it('does not bump versions or rewrite files on repeated runs', async () => {
    const { root, files, read } = await fixture();
    await syncOfflineMapRuntime(root);
    const before = await Promise.all(Object.keys(files).map(read));
    await expect(syncOfflineMapRuntime(root)).resolves.toEqual({
      version: '6.12.0',
      changed: false,
    });
    expect(await Promise.all(Object.keys(files).map(read))).toEqual(before);
  });

  it.each(['bundle', 'renderer', 'worker'])(
    'fails before any writes if the %s format changed',
    async (kind) => {
      const { root, files, read } = await fixture();
      const path = {
        bundle: 'node_modules/maplibre-gl/dist/maplibre-gl.mjs',
        renderer: 'public/offline-map/offline-orders-map.mjs',
        worker: 'public/sw.js',
      }[kind];
      await writeFile(
        join(root, path),
        (await read(path)).replace(
          kind === 'bundle'
            ? './maplibre-gl-shared.mjs'
            : kind === 'renderer'
              ? "version: '26'"
              : "const VERSION = 'v40'",
          'unexpected format'
        )
      );
      const before = await Promise.all(Object.keys(files).map(read));
      await expect(syncOfflineMapRuntime(root)).rejects.toThrow('Missing runtime marker');
      expect(await Promise.all(Object.keys(files).map(read))).toEqual(before);
    }
  );
});
