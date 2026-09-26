import { test, expect } from './fixtures';
import { login } from './session';

for (const viewport of [
  { width: 390, height: 844 },
  { width: 1080, height: 1920 },
  { width: 1440, height: 900 },
]) {
  test(`navigation and compiled styles at ${viewport.width}x${viewport.height}`, async ({ page, authenticate }, testInfo) => {
    await page.setViewportSize(viewport);
    await authenticate();
    await page.goto('/clog');
    const nav = page.getByRole('navigation', { name: 'Main navigation' });
    await expect(nav).toBeVisible();
    const logo = nav.locator('img');
    await expect(logo).toHaveCSS('width', '32px');
    expect(await logo.evaluate((img: HTMLImageElement) => img.naturalWidth)).toBeGreaterThan(0);
    const bounds = await nav.boundingBox();
    expect(bounds!.x + bounds!.width).toBeLessThanOrEqual(viewport.width);
    await page.getByTestId('skip-to-content').focus();
    await page.keyboard.press('Enter');
    await expect(page.getByRole('main')).toBeFocused();
    await page.screenshot({ path: testInfo.outputPath('frame.png'), fullPage: true });
    if (viewport.width < 768) {
      const toggle = page.getByRole('button', { name: 'Open navigation' });
      await toggle.focus();
      await page.keyboard.press('Enter');
      await expect(page.getByRole('dialog')).toBeVisible();
      await page.keyboard.press('Escape');
      await expect(toggle).toBeFocused();
      await toggle.click();
    }
    const items = page.getByRole('link', { name: 'Items', exact: true });
    await expect(items).toHaveAttribute('href', '/clog/items');
    await items.focus();
    await page.keyboard.press('Enter');
    await expect(page).toHaveURL(/\/clog\/items$/);
    await expect(page.getByRole('dialog')).toHaveCount(0);
    await page.goBack();
    await expect(page).toHaveURL(/\/clog(?:#.*)?$/);
  });
}

test('WordPress deep routes load the StyleX stylesheet and bundled logo', async ({ page, context }) => {
  const base = process.env.WP_SHELL_URL || new URL(process.env.VITE_GRAPHQL_URL || 'http://localhost:8080').origin;
  await login(context.request, base);
  await page.goto(`${base}/clog/items/new`);
  await expect(page.getByRole('textbox', { name: /^Name/ })).toBeVisible();
  const stylesheet = page.locator('link[rel="stylesheet"][href*="stylex.css?ver="]');
  await expect(stylesheet).toHaveCount(1);
  expect((await context.request.get((await stylesheet.getAttribute('href'))!)).ok()).toBe(true);
  const logo = page.getByRole('navigation', { name: 'Main navigation' }).locator('img');
  await expect(logo).toHaveCSS('width', '32px');
  expect(await logo.evaluate((img: HTMLImageElement) => img.naturalWidth)).toBeGreaterThan(0);
});


test.describe('Navigation', () => {
  test('header navigation links work correctly', async ({ page, waitForData, authenticate }) => {
    await authenticate();
    await page.goto('/clog');
    await waitForData(page);

    // Navigate to Items
    await page.getByRole('navigation').getByRole('link', { name: 'Items' }).click();
    await expect(page).toHaveURL('/clog/items');

    // Navigate to Locations
    await page.getByRole('navigation').getByRole('link', { name: 'Locations' }).click();
    await expect(page).toHaveURL('/clog/locations');

    // Navigate to Inventory
    await page.getByRole('navigation').getByRole('link', { name: 'Inventory' }).click();
    await expect(page).toHaveURL('/clog/inventory');

    // Navigate Home via logo
    await page.getByRole('link', { name: 'Clog' }).click();
    await expect(page).toHaveURL('/clog');
  });
});
