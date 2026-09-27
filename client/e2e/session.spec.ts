import { test, expect } from './fixtures';
import { login } from './session';

test('WordPress serves the built app using cookies without the JWT plugin', async ({ page, context }) => {
  const base = process.env.WP_SHELL_URL || new URL(process.env.VITE_GRAPHQL_URL || 'http://localhost:8180').origin;
  await login(context.request, base);
  await page.goto(`${base}/clog/items`);
  await expect(page.getByText('Heinz Ketchup', { exact: true })).toBeVisible();
  expect(await page.locator('#clog-config').textContent()).toContain('ajaxUrl');
  expect(await page.evaluate(() => '__CLOG_TOKEN__' in window)).toBe(false);
});

test('anonymous session is private and cannot read or mutate GraphQL inventory', async ({ page, context }) => {
  const session = await context.request.get('/wp-admin/admin-ajax.php?action=clog_graphql_session');
  expect(session.headers()['cache-control']).toContain('no-store');
  expect((await session.json()).nonce).toBeNull();
  const result = await context.request.post('/graphql', {
    data: { query: '{ clogItems { nodes { id name } } }' },
  });
  const body = await result.json();
  expect(body.data?.clogItems?.nodes ?? []).toHaveLength(0);
  const mutation = await context.request.post('/graphql', {
    data: { query: 'mutation { createClogItem(input: {name: "Clog E2E forbidden"}) { clogItem { id } } }' },
  });
  expect((await mutation.json()).errors?.length).toBeGreaterThan(0);
  await page.goto('/clog');
  await expect(page.getByRole('heading', { name: 'Sign in to continue' })).toBeVisible();
  await expect(page.getByRole('navigation')).toHaveCount(0);
});

test('cookie session uses fresh nonces and preserves drafts after expiry', async ({ page, context, authenticate }) => {
  await authenticate();
  const request = page.waitForRequest((req) => req.url().endsWith('/graphql'));
  await page.goto('/clog/items/new');
  expect((await request).headers()['x-wp-nonce']).toBeTruthy();
  expect((await request).headers()['authorization']).toBeUndefined();
  await page.getByRole('textbox', { name: /^Name/ }).fill('Unsubmitted draft');
  await context.clearCookies();
  await page.evaluate(() => window.dispatchEvent(new Event('focus')));
  await expect(page.getByRole('heading', { name: 'Sign in to continue' })).toBeVisible();
  await expect(page.getByRole('textbox', { name: /^Name/ })).toBeHidden();
  await login(context.request);
  await page.getByRole('button', { name: 'Check session' }).click();
  await expect(page.getByRole('textbox', { name: /^Name/ })).toHaveValue('Unsubmitted draft');
  expect(await page.evaluate(() => localStorage.getItem('clog_jwt_token'))).toBeNull();
});

test('logout is nonce protected and clears inventory in other tabs', async ({ page, context, authenticate }) => {
  await authenticate();
  const rejected = await context.request.post('/wp-admin/admin-ajax.php?action=clog_logout');
  expect(rejected.status()).toBe(403);
  await page.goto('/clog/items');
  await expect(page.getByText('Heinz Ketchup', { exact: true })).toBeVisible();
  const other = await context.newPage();
  await other.goto('/clog/items');
  await expect(other.getByText('Heinz Ketchup', { exact: true })).toBeVisible();
  page.on('dialog', (dialog) => dialog.accept());
  await page.getByRole('button', { name: 'Sign out' }).click();
  for (const tab of [page, other]) {
    await expect(tab.getByRole('heading', { name: 'Session ended' })).toBeVisible();
    await expect(tab.getByText('Heinz Ketchup', { exact: true })).toHaveCount(0);
  }
  const session = await context.request.get('/wp-admin/admin-ajax.php?action=clog_graphql_session');
  expect((await session.json()).nonce).toBeNull();
});

test('account switch discards previous-account UI before accepting new data', async ({ page, authenticate }) => {
  await authenticate();
  await page.goto('/clog/items');
  await expect(page.getByText('Heinz Ketchup', { exact: true })).toBeVisible();
  await page.route('**/admin-ajax.php?action=clog_graphql_session', async (route) => {
    await route.fulfill({ json: { userId: 'different-user', nonce: 'new-session', canWrite: false } });
  });
  await page.evaluate(() => window.dispatchEvent(new Event('focus')));
  await expect(page.getByRole('heading', { name: 'Session ended' })).toBeVisible();
  await expect(page.getByText('Heinz Ketchup', { exact: true })).toHaveCount(0);
});

test('a lost mutation response is not replayed and leaves input available', async ({ page, authenticate }) => {
  await authenticate();
  let writes = 0;
  await page.route('**/graphql', async (route) => {
    if (route.request().postDataJSON()?.operationName === 'ItemFormCreateMutation') {
      writes++;
      await route.fetch(); // The server committed; only its response is lost.
      await route.abort('failed');
    } else {
      await route.continue();
    }
  });
  await page.goto('/clog/items/new');
  await page.getByRole('textbox', { name: /^Name/ }).fill('Clog E2E Lost response');
  await page.getByRole('button', { name: 'Create', exact: true }).click();
  await expect(page.getByRole('alert').filter({ hasText: 'Check inventory before retrying' })).toContainText('Check inventory before retrying');
  await expect(page.getByRole('textbox', { name: /^Name/ })).toHaveValue('Clog E2E Lost response');
  expect(writes).toBe(1);
});
