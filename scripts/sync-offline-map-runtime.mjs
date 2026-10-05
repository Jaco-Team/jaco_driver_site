import { readFile, writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const PROJECT_ROOT = fileURLToPath(new URL('../', import.meta.url));
const BUNDLES = [
  'maplibre-gl.mjs',
  'maplibre-gl-shared.mjs',
  'maplibre-gl-worker.mjs',
  'maplibre-gl.css',
];
const RENDERER = 'public/offline-map/offline-orders-map.mjs';
const WORKER = 'public/sw.js';
const LOADER = 'shared/lib/offline/offlineMapRuntime.ts';
const ASSETS = 'shared/lib/offline/offlineMapAssets.ts';

function replaceRequired(source, pattern, replacement, path) {
  if (!pattern.test(source)) throw new Error(`Missing runtime marker in ${path}`);
  return source.replace(pattern, replacement);
}

export async function syncOfflineMapRuntime(root = PROJECT_ROOT) {
  const read = (path) => readFile(resolve(root, path), 'utf8');
  const { version } = JSON.parse(await read('node_modules/maplibre-gl/package.json'));
  if (!/^\d+\.\d+\.\d+(?:-[\w.-]+)?$/.test(version)) {
    throw new Error('Invalid MapLibre version');
  }

  const originals = new Map();
  const updates = new Map();
  for (const name of BUNDLES) {
    const path = `public/offline-map/runtime/${name}`;
    const source = await read(`node_modules/maplibre-gl/dist/${name}`);
    let output = source.replace(/^\/\/#[ \t]*sourceMappingURL=.*$/gm, '');
    if (name === 'maplibre-gl.mjs' || name === 'maplibre-gl-worker.mjs') {
      output = replaceRequired(
        output,
        /\.\/maplibre-gl-shared\.mjs/g,
        `./maplibre-gl-shared.mjs?v=${version}`,
        name
      );
    }
    if (name === 'maplibre-gl.mjs') {
      output = replaceRequired(
        output,
        /(["'`])maplibre-gl-worker\.mjs\1/g,
        `$1maplibre-gl-worker.mjs?v=${version}$1`,
        name
      );
    }
    originals.set(path, await read(path));
    updates.set(path, output);
  }

  for (const path of [RENDERER, WORKER, LOADER, ASSETS]) {
    const source = await read(path);
    originals.set(path, source);
    let output = source;
    if (path !== LOADER) {
      const names = path === RENDERER ? [BUNDLES[0]] : BUNDLES;
      for (const name of names) {
        const escaped = name.replaceAll('.', '\\.');
        output = replaceRequired(
          output,
          new RegExp(`/offline-map/runtime/${escaped}(?:\\?v=[\\w.-]+)?`, 'g'),
          `/offline-map/runtime/${name}?v=${version}`,
          path
        );
      }
    }
    updates.set(path, output);
  }

  if (![...updates].some(([path, output]) => originals.get(path) !== output)) {
    return { version, changed: false };
  }

  // Validate every marker before writing; a changed distribution must not leave mixed versions.
  const loader = originals.get(LOADER);
  const runtimeVersion = loader.match(/OFFLINE_MAP_RUNTIME_VERSION = '(\d+)'/)?.[1];
  if (!runtimeVersion) throw new Error('Missing offline runtime version');
  const nextRuntimeVersion = String(Number(runtimeVersion) + 1);
  updates.set(
    LOADER,
    replaceRequired(
      loader,
      /OFFLINE_MAP_RUNTIME_VERSION = '\d+'/,
      `OFFLINE_MAP_RUNTIME_VERSION = '${nextRuntimeVersion}'`,
      LOADER
    )
  );
  updates.set(
    RENDERER,
    replaceRequired(
      updates.get(RENDERER),
      new RegExp(`JacoOfflineOrdersMap = \\{ version: '${runtimeVersion}'`),
      `JacoOfflineOrdersMap = { version: '${nextRuntimeVersion}'`,
      RENDERER
    )
  );
  let worker = replaceRequired(
    updates.get(WORKER),
    new RegExp(`/offline-map/offline-orders-map\\.mjs\\?v=${runtimeVersion}(?=['"])`, 'g'),
    `/offline-map/offline-orders-map.mjs?v=${nextRuntimeVersion}`,
    WORKER
  );
  worker = replaceRequired(
    worker,
    /const VERSION = 'v(\d+)'/,
    (_match, number) => `const VERSION = 'v${Number(number) + 1}'`,
    WORKER
  );
  updates.set(WORKER, worker);

  for (const [path, output] of updates) {
    if (originals.get(path) !== output) await writeFile(resolve(root, path), output);
  }
  return { version, changed: true };
}

if (process.argv[1] && pathToFileURL(resolve(process.argv[1])).href === import.meta.url) {
  const { version, changed } = await syncOfflineMapRuntime();
  console.log(
    `MapLibre ${version}: ${changed ? 'offline runtime synchronized' : 'already synchronized'}`
  );
}
