#!/usr/bin/env node
/**
 * Syncs .env → src/environments/environment.ts + proxy.conf.json
 * so you can paste keys in .env and restart `npm run dev`.
 */
import { readFileSync, writeFileSync, existsSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const envPath = resolve(root, '.env');

function loadEnv(path) {
  const out = {};
  if (!existsSync(path)) return out;
  for (const line of readFileSync(path, 'utf8').split(/\r?\n/)) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;
    const i = trimmed.indexOf('=');
    if (i < 0) continue;
    out[trimmed.slice(0, i).trim()] = trimmed.slice(i + 1).trim();
  }
  return out;
}

const env = loadEnv(envPath);
const apiKey =
  process.env.DRODIN_API_KEY ||
  process.env.VITE_DRODIN_API_KEY ||
  env.DRODIN_API_KEY ||
  env.VITE_DRODIN_API_KEY ||
  'drod_fca4ae78eb4152fbe219af265b43df1216f537571c38fb0a50e27ade1718cfb3';
const gateway =
  process.env.DRODIN_GATEWAY ||
  process.env.VITE_DRODIN_GATEWAY ||
  env.DRODIN_GATEWAY ||
  env.VITE_DRODIN_GATEWAY ||
  'https://api.drodin.in';
const appId =
  process.env.DRODIN_APP_ID ||
  process.env.VITE_DRODIN_APP_ID ||
  env.DRODIN_APP_ID ||
  env.VITE_DRODIN_APP_ID ||
  '';

if (!apiKey) {
  console.warn('[sync-env] No DRODIN_API_KEY (or VITE_DRODIN_API_KEY) found in process.env or .env');
}

const environmentTs = `export const environment = {
  production: false,
  /** Synced from .env — run \`npm run sync-env\` or restart \`npm run dev\` after edits */
  drodinApiKey: ${JSON.stringify(apiKey)},
  drodinAppId: ${JSON.stringify(appId)},
  /**
   * Real gateway (shown in UI). Browser cannot call this directly (CORS).
   * ng serve proxies /api → this host via proxy.conf.json
   */
  drodinGateway: ${JSON.stringify(gateway)},
  /**
   * SDK base URL: empty = same origin (http://127.0.0.1:5180) so /api is proxied.
   */
  drodinApiUrl: '',
};
`;

writeFileSync(resolve(root, 'src/environments/environment.ts'), environmentTs);

const proxy = {
  '/api': {
    target: gateway,
    secure: false,
    changeOrigin: true,
    logLevel: 'debug',
  },
};
writeFileSync(resolve(root, 'proxy.conf.json'), `${JSON.stringify(proxy, null, 2)}\n`);

console.log(`[sync-env] key=${apiKey ? `${apiKey.slice(0, 12)}…` : '(empty)'} gateway=${gateway}`);
