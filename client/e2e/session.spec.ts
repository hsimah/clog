import { test, expect } from './fixtures';

test('anonymous session is private and cannot read or mutate GraphQL inventory', async ({ page, context }) => {
  const session = await context.request.get('/auth/session');
  expect(session.headers()['cache-control']).toContain('no-store');
  expect((await session.json()).nonce).toBeNull();
  const result = await context.request.post('/graphql', {
    data: { query: '{ clogItems { nodes { id name } } }' },
  });
  expect(result.status()).toBe(401);
  const mutation = await context.request.post('/graphql', {
    data: { query: 'mutation { createClogItem(input: {name: "Clog E2E forbidden"}) { clogItem { id } } }' },
  });
  expect(mutation.status()).toBe(401);
  await page.goto('/');
  await expect(page.getByRole('heading', { name: 'Sign in to continue' })).toBeVisible();
  await expect(page.getByRole('navigation')).toHaveCount(0);
});

test('GraphQL requests carry the session nonce instead of an authorization header', async ({ page, authenticate }) => {
  await authenticate();
  await page.goto('/');
  await expect(page.getByRole('heading', { name: 'Overview', exact: true })).toBeVisible();
  const request = page.waitForRequest((req) => req.url().endsWith('/graphql'));
  await page.getByRole('navigation').getByRole('link', { name: 'Items', exact: true }).click();
  expect((await request).headers()['x-clog-csrf']).toBeTruthy();
  expect((await request).headers()['authorization']).toBeUndefined();
});

test('reader can load the workspace but cannot submit changes', async ({ page, authenticate }) => {
  await authenticate('reader');
  await page.goto('/items/new');
  await expect(page.getByRole('textbox', { name: /^Name/ })).toBeVisible();
  await expect(page.getByRole('button', { name: 'Create', exact: true })).toBeDisabled();
});

test('logout is nonce protected and clears inventory in other tabs', async ({ page, context, authenticate }) => {
  await authenticate();
  const rejected = await context.request.post('/auth/logout');
  expect(rejected.status()).toBe(403);
  await page.goto('/items');
  await expect(page.getByText('Heinz Ketchup', { exact: true })).toBeVisible();
  const other = await context.newPage();
  await other.goto('/items');
  await expect(other.getByText('Heinz Ketchup', { exact: true })).toBeVisible();
  page.on('dialog', (dialog) => dialog.accept());
  await page.getByRole('button', { name: 'Account menu' }).click();
  await page.getByRole('menuitem', { name: 'Sign out' }).click();
  for (const tab of [page, other]) {
    await expect(tab.getByRole('heading', { name: 'Session ended' })).toBeVisible();
    await expect(tab.getByText('Heinz Ketchup', { exact: true })).toHaveCount(0);
  }
  const session = await context.request.get('/auth/session');
  expect((await session.json()).nonce).toBeNull();
});
