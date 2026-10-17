import { test, expect } from './fixtures';

for (const viewport of [
  { width: 1280, height: 900 },
  { width: 390, height: 844 },
  { width: 1080, height: 1920 },
]) {
  test(`Overview is home with padded cards at ${viewport.width}x${viewport.height}`, async ({ page, authenticate }) => {
    await page.setViewportSize(viewport);
    await authenticate();
    await page.goto('/');
    await expect(page.getByRole('heading', { name: 'Overview', exact: true })).toBeVisible();
    await expect(page.getByText('Cave Log - Inventory Management System')).toBeVisible();
    await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark');
    await expect(page.locator('body')).toHaveCSS('background-color', 'rgb(18, 18, 18)');
    await expect(page.getByRole('heading', { name: 'Overview', exact: true })).toHaveCSS('color', 'rgb(245, 245, 245)');
    if (viewport.width >= 768) {
      const activeTab = page.getByRole('link', { name: 'Overview', exact: true });
      await expect(activeTab).toHaveAttribute('aria-current', 'page');
      await expect(activeTab).toHaveCSS('background-color', 'rgb(255, 87, 34)');
    }
    for (const [title, total] of [['Items', 'Total items'], ['Locations', 'Total locations'], ['Inventory', 'Total items in stock']]) {
      const card = page.getByRole('region', { name: title, exact: true });
      await expect(card).toBeVisible();
      await expect(card.getByText(total, { exact: true })).toBeVisible();
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
  });
}

test('Overview cards link to each section', async ({ page, authenticate }) => {
  await authenticate();
  for (const [title, path] of [['Items', '/items'], ['Locations', '/locations'], ['Inventory', '/inventory']]) {
    await page.goto('/');
    await page.getByRole('region', { name: title, exact: true }).getByRole('link', { name: 'View All', exact: true }).click();
    await expect(page).toHaveURL(path);
    await expect(page.getByRole('heading', { name: title, exact: true })).toBeVisible();
  }
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
    expect(operations).toEqual([]);
  } finally {
    await execute(`mutation { deleteClogItem(input: {id: ${JSON.stringify(item)}}) { deletedId } }`);
    await execute(`mutation { deleteClogLocation(input: {id: ${JSON.stringify(location)}}) { deletedId } }`);
  }
});

test('direct dashboard load surfaces an inlined resolver error and retries', async ({ page, authenticate }) => {
  await authenticate();
  await page.route('**/*', async (route) => {
    const response = await route.fetch();
    // Keep fulfilled HTML and its resources in the same browser address space.
    if (!route.request().isNavigationRequest()) {
      await route.fulfill({ response });
      return;
    }
    const html = await response.text();
    const failed = html.replace(/(<script type="application\/json" id="tsquid-data">)(.*?)(<\/script>)/, (_, before, json, after) => {
      const payload = JSON.parse(json);
      payload.responses[0].response = {
        data: { clogSummary: null },
        errors: [{ message: 'Totals temporarily unavailable' }],
      };
      return before + JSON.stringify(payload) + after;
    });
    expect(failed).not.toBe(html);
    await route.fulfill({ response, body: failed });
  });
  const operations: string[] = [];
  page.on('request', (request) => {
    if (request.url().endsWith('/graphql')) operations.push(request.postDataJSON()?.operationName);
  });
  await page.goto('/');
  await expect(page.getByRole('alert')).toHaveText('Totals temporarily unavailable');
  expect(operations).toEqual([]);
  await page.getByRole('button', { name: 'Try again', exact: true }).click();
  await expect(page.getByRole('region', { name: 'Inventory', exact: true })).toBeVisible();
  expect(operations).toContain('HomePageQuery');
});
