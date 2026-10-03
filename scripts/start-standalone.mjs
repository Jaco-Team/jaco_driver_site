import { cpSync, mkdirSync, rmSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { pathToFileURL } from 'node:url';

const projectRoot = process.cwd();
const buildDirectory = process.env.NEXT_DIST_DIR || '.next';
if (!['.next', '.next-preview'].includes(buildDirectory)) {
  throw new Error(`Unsupported build directory: ${buildDirectory}`);
}
const standaloneRoot = resolve(projectRoot, buildDirectory, 'standalone');
const serverPath = resolve(standaloneRoot, 'server.js');

function replaceDirectory(source, destination) {
  rmSync(destination, { recursive: true, force: true });
  mkdirSync(dirname(destination), { recursive: true });
  cpSync(source, destination, { recursive: true });
}

replaceDirectory(resolve(projectRoot, 'public'), resolve(standaloneRoot, 'public'));
replaceDirectory(
  resolve(projectRoot, buildDirectory, 'static'),
  resolve(standaloneRoot, buildDirectory, 'static')
);

process.env.PORT ||= '3225';
process.env.HOSTNAME ||= 'localhost';

await import(pathToFileURL(serverPath).href);
