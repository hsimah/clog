import { test, expect, type Page } from '@playwright/test';

async function login(page: Page, role = 'editor') {
  await page.goto('/auth/login');
  await page.getByLabel('Username').fill(role);
  await page.getByLabel('Password').fill('test-password-only');
  await page.getByRole('button', { name: 'Sign in', exact: true }).click();
  await expect(page).toHaveURL(/\/$/);
}

test('compiled application creates, edits and deletes a location through standalone GraphQL', async ({ page }) => {
  const errors: string[] = [];
  page.on('pageerror', error => errors.push(error.message));
  await login(page);
  await page.goto('/locations/new');
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
  await expect(page).toHaveURL(/\/locations$/);
  await page.getByLabel('Search locations', { exact: true }).fill('SQLite renamed location');
  await expect(page.getByText('No locations found')).toBeVisible();
  expect(errors).toEqual([]);
});

test('reader can load the workspace but cannot submit changes', async ({ page }) => {
  await login(page, 'reader');
  await page.goto('/items/new');
  await expect(page.getByRole('button', { name: 'Create', exact: true })).toBeDisabled();
  const session = await (await page.request.get('/auth/session')).json() as { nonce: string };
  await page.request.post('/auth/logout', { headers: { 'X-Clog-CSRF': session.nonce } });
  await page.reload();
  await expect(page.getByRole('heading', { name: 'Sign in to continue' })).toBeVisible();
});

for (const width of [1280, 390]) {
  test(`Overview is home with padded cards at ${width}px`, async ({ page }) => {
    await page.setViewportSize({ width, height: 900 });
    await login(page);
    await expect(page.getByRole('heading', { name: 'Overview', exact: true })).toBeVisible();
    await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark');
    await expect(page.locator('body')).toHaveCSS('background-color', 'rgb(18, 18, 18)');
    await expect(page.getByRole('heading', { name: 'Overview', exact: true })).toHaveCSS('color', 'rgb(245, 245, 245)');
    if (width === 1280) {
      const activeTab = page.getByRole('link', { name: 'Overview', exact: true });
      await expect(activeTab).toHaveAttribute('aria-current', 'page');
      await expect(activeTab).toHaveCSS('background-color', 'rgb(255, 87, 34)');
    }
    for (const title of ['Items', 'Locations', 'Inventory']) {
      const card = page.getByRole('region', { name: title, exact: true });
      await expect(card).toBeVisible();
      await expect(card).toHaveCSS('border-top-color', 'rgb(255, 87, 34)');
      await expect(card.getByRole('link', { name: 'View All', exact: true })).toHaveCSS('background-color', 'rgb(66, 37, 27)');
      const bounds = await card.boundingBox();
      const heading = await card.getByRole('heading', { name: title, exact: true }).boundingBox();
      const action = await card.getByRole('link', { name: 'View All', exact: true }).boundingBox();
      expect(heading!.x - bounds!.x).toBeGreaterThanOrEqual(20);
      expect(heading!.y - bounds!.y).toBeGreaterThanOrEqual(20);
      expect(bounds!.y + bounds!.height - action!.y - action!.height).toBeGreaterThanOrEqual(20);
    }
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
    await page.getByRole('region', { name: 'Items', exact: true }).getByRole('link', { name: 'View All' }).click();
    await expect(page).toHaveURL(/\/items$/);
    await page.reload();
    await expect(page.getByRole('heading', { name: 'Items', exact: true })).toBeVisible();
  });
}
