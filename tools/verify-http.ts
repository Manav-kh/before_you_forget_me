import { readFile, writeFile } from 'node:fs/promises';
import { randomUUID } from 'node:crypto';
import path from 'node:path';
const root = process.cwd();
const base = process.env.VERIFY_URL || 'http://127.0.0.1:3000';
const origin = 'http://127.0.0.1:3001';
const credentials = await readFile(path.join(root, '.local/admin-access.txt'), 'utf8');
const email = credentials.match(/^Email: (.+)$/m)?.[1];
const password = credentials.match(/^Password: (.+)$/m)?.[1];
if (!email || !password) throw new Error('Run local setup before the HTTP checks.');
let cookie = ''; let csrf = ''; let editionId = ''; let orderReference = ''; let accessToken = '';
const checks: { check: string; passed: boolean; actual?: unknown }[] = [];
function check(label: string, passed: boolean, actual?: unknown) { checks.push({ check: label, passed, ...(actual === undefined ? {} : { actual }) }); }
async function api(route: string, method = 'GET', data?: unknown, admin = false, token?: string) {
  const headers: Record<string, string> = { Origin: origin };
  if (data !== undefined) headers['Content-Type'] = 'application/json';
  if (admin) { headers.Cookie = cookie; headers['X-CSRF-Token'] = csrf; }
  if (token) headers.Authorization = `Bearer ${token}`;
  const response = await fetch(base + '/api/' + route, { method, headers, body: data === undefined ? undefined : JSON.stringify(data) });
  const payload = await response.json().catch(() => ({}));
  return { response, data: payload.data, error: payload.error, code: payload.code };
}
try {
  for (const route of ['/', '/book', '/author', '/shop', '/shop/paperback', '/journal', '/contact', '/invite', '/checkout', '/orders', '/policies/shipping', '/policies/returns', '/policies/privacy', '/robots.txt', '/sitemap.xml']) {
    const response = await fetch(base + route); const text = await response.text();
    check('Public page ' + route, response.status === 200 && !text.includes('Internal Server Error'), response.status);
  }
  check('Unknown public page has real 404', (await fetch(base + '/not-a-real-v2-page')).status === 404);
  const denied = await api('admin/orders'); check('Unauthenticated admin rejected', denied.response.status === 401);
  const login = await api('admin/login', 'POST', { email, password });
  check('Owner can sign in', login.response.status === 200);
  if (login.response.status !== 200) throw new Error('Cannot continue authenticated checks.');
  cookie = login.response.headers.get('set-cookie')!.split(';')[0]; csrf = login.data.csrfToken;
  for (const resource of ['overview', 'editions', 'orders', 'customers', 'posts', 'enquiries', 'media', 'settings', 'audit']) {
    const result = await api('admin/' + resource, 'GET', undefined, true); check('Admin resource ' + resource, result.response.status === 200);
  }
  const noCsrf = await fetch(base + '/api/admin/settings', { method: 'PATCH', headers: { Origin: origin, Cookie: cookie, 'Content-Type': 'application/json' }, body: JSON.stringify({ tagline: 'This must never save' }) });
  check('Authenticated mutation without CSRF rejected', noCsrf.status === 403);
  const foreignOrigin = await fetch(base + '/api/admin/settings', { method: 'PATCH', headers: { Origin: 'https://foreign.invalid', Cookie: cookie, 'X-CSRF-Token': csrf, 'Content-Type': 'application/json' }, body: '{}' });
  check('Foreign origin rejected', foreignOrigin.status === 403);
  const suffix = randomUUID().slice(0, 8);
  const created = await api('admin/editions', 'POST', { slug: 'verification-' + suffix, sku: 'VERIFY-' + suffix, name: 'Local verification edition ' + suffix, format: 'Verification only', summary: 'Temporary build acceptance record.', description: 'This edition is created only to verify the local build, then archived.', pricePaise: 29950, stock: 3, isPublished: true, isFeatured: true, sortOrder: 0, imageUrl: '/media/book-jacket.webp' }, true);
  check('Edition creation', created.response.status === 201); editionId = created.data.id;
  const initial = created.data;
  const catalogue = await api('catalog'); check('Published edition reaches catalogue', catalogue.data.some((item: any) => item.id === editionId));
  const detail = await fetch(base + '/shop/' + created.data.slug); const detailHtml = await detail.text();
  check('Edition detail renders saved image and fractional price', detail.status === 200 && detailHtml.includes('book-jacket.webp') && detailHtml.includes('299.5'));
  const homeHtml = await (await fetch(base)).text(); check('Featured edition reaches homepage', homeHtml.includes(created.data.name));
  await api('admin/editions/' + editionId, 'PATCH', { isPublished: false }, true);
  check('Unpublished edition hidden from public catalogue', !(await api('catalog')).data.some((item: any) => item.id === editionId));
  check('Unpublished edition detail returns 404', (await fetch(base + '/shop/' + created.data.slug)).status === 404);
  await api('admin/editions/' + editionId, 'PATCH', { isPublished: true }, true);
  const key = randomUUID();
  const input = { idempotencyKey: key, items: [{ editionId, quantity: 1 }], customer: { name: 'Local verification reader', email: `verification-${suffix}@example.invalid`, phone: '9999999999' }, address: { line1: 'Local verification address', line2: '', city: 'Delhi', state: 'Delhi', postalCode: '110001', country: 'IN' }, notes: 'Synthetic local acceptance check. Cancel after verification.' };
  const placed = await api('orders', 'POST', input); check('Direct order saved', placed.response.status === 201);
  orderReference = placed.data.order.reference; accessToken = placed.data.accessToken;
  check('Order uses server amount and unpaid state', placed.data.order.totalPaise === 29950 && placed.data.order.paymentStatus === 'unpaid');
  const repeated = await api('orders', 'POST', input); check('HTTP retry returns same order', repeated.data.order.reference === orderReference);
  check('Reference alone cannot expose order', (await api('orders/' + orderReference)).response.status === 404);
  const own = await api('orders/' + orderReference, 'GET', undefined, false, accessToken); check('Private token opens order', own.response.status === 200 && own.data.adminNotes === undefined);
  const stale = await api('admin/editions/' + editionId, 'PATCH', { stock: 3, expectedUpdatedAt: initial.updatedAt }, true); check('Stale stock edit rejected after reservation', stale.response.status === 409);
  await api('admin/editions/' + editionId, 'PATCH', { name: 'Renamed local verification edition', pricePaise: 49900 }, true);
  const history = await api('orders/' + orderReference, 'GET', undefined, false, accessToken); check('Order history retains original item and amount', history.data.items[0].unitPricePaise === 29950 && history.data.items[0].title === initial.name);
  const cancelled = await api('orders/' + orderReference, 'PATCH', { action: 'cancel' }, false, accessToken); check('Private cancellation works', cancelled.data.status === 'cancelled');
  const cancelledAgain = await api('orders/' + orderReference, 'PATCH', { action: 'cancel' }, false, accessToken);
  const afterCancel = await api('editions/' + created.data.slug); check('Repeated cancellation restores stock once', cancelledAgain.response.status === 200 && afterCancel.data.stock === 3);
  const allOrders = await api('admin/orders', 'GET', undefined, true); check('Order visible in separate admin API', allOrders.data.some((order: any) => order.reference === orderReference));
  for (const kind of ['orders', 'customers', 'enquiries']) {
    const response = await fetch(base + '/api/admin/export/' + kind, { headers: { Cookie: cookie, Origin: origin } });
    const csv = await response.text(); check('Authorized CSV ' + kind, response.status === 200 && !csv.includes(accessToken));
  }
  const proxy = await fetch('http://127.0.0.1:3001/api/admin/session', { headers: { Cookie: cookie, Origin: origin } }); check('Separate admin proxy retains session', proxy.status === 200);
  check('Separate admin static site loads', (await fetch('http://127.0.0.1:3001')).status === 200);
} finally {
  if (orderReference && accessToken) await api('orders/' + orderReference, 'PATCH', { action: 'cancel' }, false, accessToken);
  if (editionId && cookie) await api('admin/editions/' + editionId, 'DELETE', undefined, true);
  if (cookie) await api('admin/logout', 'POST', {}, true);
  const summary = { total: checks.length, passed: checks.filter(item => item.passed).length, failed: checks.filter(item => !item.passed).length };
  await writeFile(path.join(root, 'docs/verification/v2-http-results.json'), JSON.stringify({ scope: 'Real local Next.js HTTP routes and separate admin proxy with synthetic local verification records. Test edition archived; order cancelled. No real payment or external messages.', summary, checks }, null, 2));
  console.log(JSON.stringify({ summary, failures: checks.filter(item => !item.passed) }));
  if (summary.failed) process.exitCode = 1;
}
