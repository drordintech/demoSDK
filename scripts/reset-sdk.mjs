#!/usr/bin/env node
/**
 * After replacing web-sdk/dist, run: npm run reset-sdk
 * Clears Angular/Vite prebundle cache and re-links file:web-sdk.
 */
import { rmSync, existsSync, statSync, readFileSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { spawnSync } from 'node:child_process';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');

for (const rel of ['.angular/cache', 'node_modules/.vite']) {
  const p = resolve(root, rel);
  if (existsSync(p)) {
    rmSync(p, { recursive: true, force: true });
    console.log(`[reset-sdk] removed ${rel}`);
  }
}

const uninstall = spawnSync('npm', ['uninstall', '@dr-odin/web-sdk'], {
  cwd: root,
  stdio: 'inherit',
  shell: false,
});
if (uninstall.status !== 0) process.exit(uninstall.status ?? 1);

const install = spawnSync('npm', ['install', 'file:web-sdk', '--no-fund', '--no-audit'], {
  cwd: root,
  stdio: 'inherit',
  shell: false,
});
if (install.status !== 0) process.exit(install.status ?? 1);

const esm = resolve(root, 'node_modules/@dr-odin/web-sdk/dist/dr-odin-sdk.esm.js');
const dts = resolve(root, 'node_modules/@dr-odin/web-sdk/dist/index.d.ts');
console.log(`[reset-sdk] esm mtime=${statSync(esm).mtime.toISOString()}`);
console.log(`[reset-sdk] types have FetalReading=${readFileSync(dts, 'utf8').includes('FetalReading')}`);
console.log('[reset-sdk] done — restart with: npm run dev');
