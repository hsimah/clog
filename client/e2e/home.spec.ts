import { test, expect } from './fixtures';

test.describe('Home Page', () => {
  test('displays welcome heading and seed data counts', async ({ page, waitForData, authenticate }) => {
    await authenticate();
    await page.goto('/');
    await waitForData(page);

    await expect(page.getByRole('heading', { name: 'Overview' })).toBeVisible();
    await expect(page.getByText('Cave Log - Inventory Management System')).toBeVisible();

    // Verify each card shows the correct count from seed data
    const itemsCard = page.getByRole('region', { name: 'Items', exact: true });
    await expect(itemsCard.getByText('Total items')).toBeVisible();

    const locationsCard = page.getByRole('region', { name: 'Locations', exact: true });
    await expect(locationsCard.getByText('Total locations')).toBeVisible();

    const inventoryCard = page.getByRole('region', { name: 'Inventory', exact: true });
    await expect(inventoryCard.getByText('Total items in stock')).toBeVisible();
  });

  test('navigates to items page via View All button', async ({ page, waitForData, authenticate }) => {
    await authenticate();
    await page.goto('/');
    await waitForData(page);

    await page.locator('a[href="/items"]:has-text("View All")').click();

    await expect(page).toHaveURL('/items');
    await expect(page.getByRole('heading', { name: 'Items' })).toBeVisible();
  });

  test('navigates to locations page via View All button', async ({ page, waitForData, authenticate }) => {
    await authenticate();
    await page.goto('/');
    await waitForData(page);

    await page.locator('a[href="/locations"]:has-text("View All")').click();

    await expect(page).toHaveURL('/locations');
    await expect(page.getByRole('heading', { name: 'Locations' })).toBeVisible();
  });

  test('navigates to inventory page via View All button', async ({ page, waitForData, authenticate }) => {
    await authenticate();
    await page.goto('/');
    await waitForData(page);

    await page.locator('a[href="/inventory"]:has-text("View All")').click();

    await expect(page).toHaveURL('/inventory');
    await expect(page.getByRole('heading', { name: 'Inventory' })).toBeVisible();
  });
});

test('dashboard reads authoritative totals above 100 without fetching collections', async ({ page, context, authenticate }) => {
  await authenticate();
  const session = await (await context.request.get('/auth/session')).json();
  async function execute(query: string) {
    const response = await context.request.post('/graphql', {
      headers: { 'X-Clog-CSRF': session.nonce }, data: { query },
    });
    const body = await response.json();
    expect(body.errors).toBeUndefined();
    return body.data;
  }
  const created = await execute(`mutation {
    createClogItem(input: {name: "Clog E2E Dashboard totals"}) { clogItem { id } }
    createClogLocation(input: {name: "Clog E2E Dashboard totals"}) { clogLocation { id } }
  }`);
  const item = created.createClogItem.clogItem.id;
  const location = created.createClogLocation.clogLocation.id;
  try {
    await execute(`mutation { ${Array.from({ length: 101 }, (_, index) => `s${index}: createClogInventory(input: {item: ${JSON.stringify(item)}, location: ${JSON.stringify(location)}, dateAdded: "2026-09-26T12:00:00Z"}) { clogInventory { id } }`).join('\n')} }`);
    const { clogSummary } = await execute('{ clogSummary { items locations inventory } }');
    expect(clogSummary.inventory).toBeGreaterThan(100);
    const operations: string[] = [];
    page.on('request', (request) => {
      if (request.url().endsWith('/graphql')) operations.push(request.postDataJSON()?.operationName);
    });
    await page.goto('/');
    await expect(page.getByRole('region', { name: 'Items', exact: true }).getByLabel('Total items', { exact: true })).toHaveText(String(clogSummary.items));
    await expect(page.getByRole('region', { name: 'Locations', exact: true }).getByLabel('Total locations', { exact: true })).toHaveText(String(clogSummary.locations));
    await expect(page.getByRole('region', { name: 'Inventory', exact: true }).getByLabel('Total items in stock', { exact: true })).toHaveText(String(clogSummary.inventory));
    expect(operations.length).toBeGreaterThan(0);
    expect(operations.every((operation) => operation === 'HomePageQuery')).toBe(true);
  } finally {
    await execute(`mutation { deleteClogItem(input: {id: ${JSON.stringify(item)}}) { deletedId } }`);
    await execute(`mutation { deleteClogLocation(input: {id: ${JSON.stringify(location)}}) { deletedId } }`);
  }
});

test('dashboard retries a failed summary and fits narrow and portrait screens', async ({ page, authenticate }) => {
  await authenticate();
  let fail = true;
  await page.route('**/graphql', async (route) => {
    if (route.request().postDataJSON()?.operationName === 'HomePageQuery' && fail) {
      fail = false;
      await route.fulfill({ json: { errors: [{ message: 'Totals temporarily unavailable' }] } });
    } else await route.continue();
  });
  await page.goto('/');
  await expect(page.getByRole('alert')).toHaveText('Totals temporarily unavailable');
  await page.getByRole('button', { name: 'Try again' }).click();
  await expect(page.getByRole('region', { name: 'Inventory', exact: true })).toBeVisible();
  for (const size of [{ width: 390, height: 844 }, { width: 1080, height: 1920 }]) {
    await page.setViewportSize(size);
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
    for (const name of ['Items', 'Locations', 'Inventory']) {
      const card = page.getByRole('region', { name, exact: true });
      await expect(card.getByRole('link', { name: 'View All', exact: true })).toBeVisible();
      const box = await card.boundingBox();
      expect(box?.width).toBeLessThanOrEqual(size.width);
    }
  }
});
