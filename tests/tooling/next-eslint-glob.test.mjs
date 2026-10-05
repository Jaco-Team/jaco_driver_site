// @vitest-environment node
import { mkdtemp, mkdir, rm, writeFile } from 'node:fs/promises';
import { createRequire } from 'node:module';
import { tmpdir } from 'node:os';
import { join, relative, resolve } from 'node:path';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';

const require = createRequire(import.meta.url);
const { getRootDirs } = require('@next/eslint-plugin-next/dist/utils/get-root-dirs.js');
const { Linter } = require('eslint');
const plugin = require('@next/eslint-plugin-next');
let root;

beforeEach(async () => {
  root = await mkdtemp(join(tmpdir(), 'jaco-eslint-'));
  await mkdir(join(root, 'apps', 'driver'), { recursive: true });
  await mkdir(join(root, 'apps', 'client'), { recursive: true });
  await writeFile(join(root, 'apps', 'not-a-directory'), '');
});
afterEach(async () => rm(root, { recursive: true, force: true }));

const context = (rootDir) => ({ cwd: root, settings: { next: { rootDir } } });
const expected = () => [join(root, 'apps', 'client'), join(root, 'apps', 'driver')].sort();
// The plugin consumes paths through fs/path; compare the directories they resolve to.
const directories = (rootDir) =>
  getRootDirs(context(rootDir))
    .map((dir) => resolve(dir))
    .sort();

describe('Next ESLint root directories with the scoped tinyglobby override', () => {
  it('defaults to the ESLint working directory', () => {
    expect(getRootDirs(context(undefined))).toEqual([root]);
  });
  it('expands a directory glob and excludes files', () => {
    expect(directories(`${root}/apps/*`)).toEqual(expected());
  });
  it('expands brace patterns', () => {
    expect(directories(`${root}/apps/{driver,client}`)).toEqual(expected());
  });
  it('accepts arrays and ignores non-string entries', () => {
    expect(directories([`${root}/apps/driver`, null, `${root}/apps/client`])).toEqual(expected());
  });
  it('normalizes backslashes and accepts trailing slashes', () => {
    expect(directories(`${root}/apps/*/`.replaceAll('/', '\\'))).toEqual(expected());
  });
  it('accepts relative directory patterns', () => {
    expect(directories(`${relative(process.cwd(), root)}/apps/*`)).toEqual(expected());
  });
  it('returns no directories for a non-matching glob', () => {
    expect(getRootDirs(context(`${root}/missing/*`))).toEqual([]);
  });
  it.each(['absolute', 'relative'])(
    'still detects internal HTML links with a %s root glob',
    async (kind) => {
      const pages = join(root, 'apps', 'driver', 'pages');
      await mkdir(pages);
      await writeFile(join(pages, 'orders.tsx'), 'export default function Orders() {}');
      const base = kind === 'absolute' ? root : relative(process.cwd(), root);
      const messages = new Linter().verify('const link = <a href="/orders">Orders</a>;', {
        languageOptions: { parserOptions: { ecmaFeatures: { jsx: true } } },
        plugins: { '@next/next': plugin },
        settings: { next: { rootDir: `${base}/apps/*` } },
        rules: { '@next/next/no-html-link-for-pages': 'error' },
      });
      expect(messages).toHaveLength(1);
      expect(messages[0].ruleId).toBe('@next/next/no-html-link-for-pages');
      expect(messages[0].message).toContain('Use `<Link />`');
    }
  );
});
