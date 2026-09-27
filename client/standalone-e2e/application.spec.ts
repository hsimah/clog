import { test, expect, type Page } from '@playwright/test';

async function login(page: Page, role = 'editor') {
  await page.goto('/auth/login');
  await page.getByLabel('Username').fill(role);
  await page.getByLabel('Password').fill('test-password-only');
  await page.getByRole('button', { name: 'Sign in', exact: true }).click();
  await expect(page).toHaveURL(/\/clog$/);
}

test('compiled application creates, edits and deletes a location through standalone GraphQL', async ({ page }) => {
  const errors: string[] = [];
  page.on('pageerror', error => errors.push(error.message));
  await login(page);
  await page.goto('/clog/locations/new');
  await page.getByRole('textbox', { name: /^Name/ }).fill('SQLite browser location');
  await page.getByRole('button', { name: 'Create', exact: true }).click();
  await expect(page.getByRole('heading', { name: 'SQLite browser location' })).toBeVisible();
  await page.reload();
  await expect(page.getByRole('heading', { name: 'SQLite browser location' })).toBeVisible();
  await page.getByRole('link', { name: 'Edit', exact: true }).click();
  await page.getByRole('textbox', { name: /^Name/ }).fill('SQLite renamed location');
  await page.getByRole('button', { name: 'Update', exact: true }).click();
  await expect(page.getByRole('heading', { name: 'SQLite renamed location' })).toBeVisible();
  page.on('dialog', dialog => dialog.accept());
  await page.getByRole('button', { name: 'Delete', exact: true }).click();
  await expect(page).toHaveURL(/\/clog\/locations$/);
  await page.getByLabel('Search locations', { exact: true }).fill('SQLite renamed location');
  await expect(page.getByText('No locations found')).toBeVisible();
  expect(errors).toEqual([]);
});

test('reader can load the workspace but cannot submit changes', async ({ page }) => {
  await login(page, 'reader');
  await page.goto('/clog/items/new');
  await expect(page.getByRole('button', { name: 'Create', exact: true })).toBeDisabled();
  const session = await (await page.request.get('/auth/session')).json() as { nonce: string };
  await page.request.post('/auth/logout', { headers: { 'X-Clog-CSRF': session.nonce } });
  await page.reload();
  await expect(page.getByRole('heading', { name: 'Sign in to continue' })).toBeVisible();
});
