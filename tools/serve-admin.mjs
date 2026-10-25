import http from 'node:http';
import https from 'node:https';
import { readFile, stat } from 'node:fs/promises';
import { dirname, extname, resolve, sep } from 'node:path';
import { fileURLToPath } from 'node:url';

// A same-origin proxy keeps the admin frontend separate without exposing credentials.
const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const directory = resolve(root, 'apps/admin/dist');
const api = new URL(process.env.API_INTERNAL_URL || 'http://127.0.0.1:3000');
const mime = { '.html': 'text/html; charset=utf-8', '.js': 'text/javascript; charset=utf-8', '.css': 'text/css; charset=utf-8', '.svg': 'image/svg+xml', '.png': 'image/png', '.webp': 'image/webp', '.woff2': 'font/woff2', '.ico': 'image/x-icon' };
http.createServer(async (request, response) => {
  const security = {
    'X-Content-Type-Options': 'nosniff', 'X-Frame-Options': 'DENY', 'Referrer-Policy': 'no-referrer',
    'Permissions-Policy': 'camera=(), microphone=(), geolocation=()',
    'Content-Security-Policy': "default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline'; img-src 'self' https: data: blob:; connect-src 'self'; frame-ancestors 'none'; base-uri 'self'; form-action 'self'; object-src 'none'",
    'Cache-Control': 'no-store'
  };
  for (const [name, value] of Object.entries(security)) response.setHeader(name, value);
  try {
    const url = new URL(request.url || '/', 'http://localhost');
    if (url.pathname.startsWith('/api/') || url.pathname.startsWith('/media/')) {
      const transport = api.protocol === 'https:' ? https : http;
      const upstream = transport.request(new URL(url.pathname + url.search, api), { method: request.method, headers: { ...request.headers, host: api.host } }, result => {
        response.writeHead(result.statusCode || 502, result.headers);
        result.pipe(response);
      });
      upstream.on('error', () => { if (!response.headersSent) response.writeHead(502, { 'Content-Type': 'application/json' }); response.end(JSON.stringify({ error: 'The catalogue server is unavailable. Please try again.' })); });
      request.on('aborted', () => upstream.destroy());
      request.pipe(upstream);
      return;
    }
    if (!['GET', 'HEAD'].includes(request.method || 'GET')) { response.writeHead(405); response.end(); return; }
    const pathname = decodeURIComponent(url.pathname);
    let file = resolve(directory, '.' + pathname);
    if (file !== directory && !file.startsWith(directory + sep)) { response.writeHead(404); response.end(); return; }
    try { if (!(await stat(file)).isFile()) throw new Error('Not a file'); }
    catch {
      if (extname(pathname)) { response.writeHead(404); response.end(); return; }
      file = resolve(directory, 'index.html');
    }
    const data = await readFile(file);
    response.writeHead(200, { 'Content-Type': mime[extname(file)] || 'application/octet-stream', 'Content-Length': data.length });
    response.end(request.method === 'HEAD' ? undefined : data);
  } catch { if (!response.headersSent) response.writeHead(500); response.end('The admin website could not be loaded. Build the app and try again.'); }
}).listen(3001, '127.0.0.1', () => console.log('Admin website: http://127.0.0.1:3001'));
