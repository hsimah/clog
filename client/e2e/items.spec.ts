import { test, expect } from './fixtures';

test.describe('Items', () => {
  test('lists seed items', async ({ page, waitForData, authenticate }) => {
    await authenticate();
    await page.goto('/clog/items');
    await waitForData(page);

    await expect(page.getByRole('heading', { name: 'Items' })).toBeVisible();
    await expect(page.getByRole('link', { name: 'Heinz Ketchup' })).toBeVisible();
    await expect(page.getByRole('link', { name: 'Dry Dog Food' })).toBeVisible();
    await expect(page.getByRole('link', { name: 'Wet Dog Food' })).toBeVisible();
  });

  test('search filters items by name', async ({ page, waitForData, authenticate }) => {
    await authenticate();
    await page.goto('/clog/items');
    await waitForData(page);

    await page.getByPlaceholder('Search items...').fill('ketchup');
    await expect(page.getByRole('link', { name: 'Heinz Ketchup' })).toBeVisible();
    await expect(page.getByRole('link', { name: 'Dry Dog Food' })).not.toBeVisible();
    await expect(page.getByRole('link', { name: 'Wet Dog Food' })).not.toBeVisible();
  });

  test('search shows no results message', async ({ page, waitForData, authenticate }) => {
    await authenticate();
    await page.goto('/clog/items');
    await waitForData(page);

    await page.getByPlaceholder('Search items...').fill('nonexistent item xyz');
    await expect(page.getByText('No items found')).toBeVisible();
  });

  test('creates a new item', async ({ page, waitForData, authenticate }) => {
    await authenticate();
    await page.goto('/clog/items/new');
    await waitForData(page);

    await page.getByLabel('Name').fill('Clog E2E Canned Beans');
    await page.getByRole('button', { name: 'Create' }).click();

    // Should redirect to the new item detail page (opaque GraphQL ID)
    await expect(page).toHaveURL(/\/clog\/items\/[^/]+$/);
    await expect(page.getByRole('heading', { name: 'Clog E2E Canned Beans' })).toBeVisible();
  });

  test('creates a new item with a barcode', async ({ page, waitForData, authenticate }) => {
    await authenticate();
    await page.goto('/clog/items/new');
    await waitForData(page);

    await page.getByLabel('Name').fill('Clog E2E Milk');
    await page.getByPlaceholder('Enter barcode').fill('1234567890');

    await page.getByRole('button', { name: 'Create' }).click();

    await expect(page).toHaveURL(/\/clog\/items\/[^/]+$/);
    await expect(page.getByRole('heading', { name: 'Clog E2E Milk' })).toBeVisible();
    await expect(page.getByRole('complementary').getByText('1234567890')).toBeVisible();
  });

  test('navigates to item detail page', async ({ page, waitForData, authenticate }) => {
    await authenticate();
    await page.goto('/clog/items');
    await waitForData(page);

    await page.getByRole('link', { name: 'Heinz Ketchup' }).click();

    await expect(page).toHaveURL(/\/clog\/items\/[^/]+$/);
    await expect(page.getByRole('heading', { name: 'Heinz Ketchup' })).toBeVisible();
  });
});
