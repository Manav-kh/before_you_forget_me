import { spawn } from 'node:child_process';
import { existsSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
if (existsSync(resolve(root, '.env.local'))) process.loadEnvFile(resolve(root, '.env.local'));
const production = process.argv.includes('--production');
if (production && !process.env.DATABASE_URL) {
  console.error('Production requires DATABASE_URL for a PostgreSQL server. Use npm run dev for the embedded local PostgreSQL preview.');
  process.exit(1);
}
const env = { ...process.env, BYFM_ROOT: root, STOREFRONT_ORIGIN: process.env.STOREFRONT_ORIGIN || 'http://127.0.0.1:3000', ADMIN_ORIGIN: process.env.ADMIN_ORIGIN || 'http://127.0.0.1:3001' };
const configs = [
  { name: 'storefront', cwd: 'apps/storefront', script: 'next/dist/bin/next', args: production ? ['start', '--hostname', '127.0.0.1', '--port', '3000'] : ['dev', '--webpack', '--hostname', '127.0.0.1', '--port', '3000'] },
  { name: 'admin', cwd: 'apps/admin', script: production ? null : 'vite/bin/vite.js', args: production ? [] : ['--host', '127.0.0.1', '--port', '3001', '--strictPort'] }
];
const children = configs.map(config => spawn(process.execPath, [config.script ? resolve(root, 'node_modules', config.script) : resolve(root, 'tools/serve-admin.mjs'), ...config.args], { cwd: resolve(root, config.cwd), env, stdio: 'inherit', windowsHide: true }));
let stopping = false;
function stop(code = 0) { if (stopping) return; stopping = true; for (const child of children) child.kill('SIGTERM'); setTimeout(() => process.exit(code), 800).unref(); }
for (const child of children) child.on('exit', code => { if (!stopping) stop(code || 0); });
process.on('SIGINT', () => stop());
process.on('SIGTERM', () => stop());
console.log('\nStorefront: http://127.0.0.1:3000\nSeparate admin: http://127.0.0.1:3001\nAdmin credentials: .local/admin-access.txt\n');
