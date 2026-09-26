import type { APIRequestContext } from '@playwright/test';

export async function login(request: APIRequestContext, base = 'http://localhost:3000') {
  const username = process.env.WP_ADMIN_USER;
  const password = process.env.WP_ADMIN_PASSWORD;
  if (!username || !password) throw new Error('WP_ADMIN_USER and WP_ADMIN_PASSWORD are required.');
  await request.get(`${base}/wp-login.php`);
  await request.post(`${base}/wp-login.php`, {
    form: { log: username, pwd: password, 'wp-submit': 'Log In', testcookie: '1', redirect_to: '/clog' },
    maxRedirects: 0,
  });
  const response = await request.get(`${base}/wp-admin/admin-ajax.php?action=clog_graphql_session`);
  const session = await response.json();
  if (!response.ok() || !session.nonce || session.userId === '0') throw new Error('WordPress cookie login failed.');
  return session as { nonce: string; userId: string; canWrite: boolean };
}
