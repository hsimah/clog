import type { APIRequestContext } from '@playwright/test';

export async function login(request: APIRequestContext, base = process.env.CLOG_TEST_URL || 'http://127.0.0.1:18473', username = 'editor', password = 'test-password-only') {
  const page = await request.get(`${base}/auth/login`);
  const csrf = (await page.text()).match(/name="csrf" value="([^"]+)"/)?.[1];
  if (!page.ok() || !csrf) throw new Error('Login page did not provide a CSRF token.');
  const result = await request.post(`${base}/auth/login`, {
    form: { username, password, csrf },
    maxRedirects: 0,
  });
  if (result.status() !== 303) throw new Error('Test account login failed.');
  const response = await request.get(`${base}/auth/session`);
  const session = await response.json();
  if (!response.ok() || !session.nonce || session.userId === '0') throw new Error('Session was not established.');
  return session as { nonce: string; userId: string; canWrite: boolean; isAdmin: boolean };
}
