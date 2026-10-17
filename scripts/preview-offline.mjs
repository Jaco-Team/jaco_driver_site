import { spawnSync } from 'node:child_process';
import { createRequire } from 'node:module';
import { constants } from 'node:os';
import { resolve } from 'node:path';
import { pathToFileURL } from 'node:url';

const require = createRequire(import.meta.url);
const nextRequire = createRequire(require.resolve('next/package.json'));
const { loadEnvConfig } = nextRequire('@next/env');

export function runOfflinePreview({
  projectRoot = process.cwd(),
  loadEnv = loadEnvConfig,
  run = spawnSync,
} = {}) {
  // Read the same local env as next dev, but keep the build and SW in production mode.
  process.env.NODE_ENV = 'production';
  const { combinedEnv } = loadEnv(projectRoot, true);
  const apiOrigin =
    combinedEnv.NEXT_PUBLIC_API_ORIGIN?.trim() || combinedEnv.NEXT_PUBLIC_API_URL?.trim();
  let apiUrl;
  try {
    apiUrl = new URL(apiOrigin);
  } catch {
    throw new Error(
      'Укажите NEXT_PUBLIC_API_ORIGIN в .env.development.local перед запуском preview:offline.'
    );
  }
  if (!['http:', 'https:'].includes(apiUrl.protocol)) {
    throw new Error('NEXT_PUBLIC_API_ORIGIN должен быть HTTP(S)-адресом API.');
  }

  const npmCli = process.env.npm_execpath;
  if (!npmCli) {
    throw new Error('Запускайте офлайн-preview командой npm run preview:offline.');
  }
  const childEnv = {
    ...combinedEnv,
    NEXT_PUBLIC_API_ORIGIN: apiOrigin,
    NODE_ENV: 'production',
    NEXT_DIST_DIR: '.next-preview',
    // The local env is already resolved; do not merge production env files in the children.
    __NEXT_PROCESSED_ENV: 'true',
  };

  for (const script of ['build', 'start:standalone']) {
    const result = run(process.execPath, [npmCli, 'run', script], {
      cwd: projectRoot,
      env: childEnv,
      stdio: 'inherit',
    });
    if (result.error) throw result.error;
    if (result.signal) return 128 + (constants.signals[result.signal] || 1);
    if (result.status !== 0) return result.status ?? 1;
  }
  return 0;
}

if (process.argv[1] && import.meta.url === pathToFileURL(resolve(process.argv[1])).href) {
  try {
    process.exitCode = runOfflinePreview();
  } catch (error) {
    console.error(error instanceof Error ? error.message : 'Не удалось запустить офлайн-preview.');
    process.exitCode = 1;
  }
}
