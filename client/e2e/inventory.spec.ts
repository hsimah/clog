import { test, expect } from './fixtures';

test.describe('Inventory', () => {
  test('lists seed inventory grouped by item', async ({ page, waitForData, authenticate }) => {
    await authenticate();
    await page.goto('/clog/inventory');
    await waitForData(page);

    await expect(page.getByRole('heading', { name: 'Inventory' })).toBeVisible();
    await expect(page.getByRole('link', { name: 'Heinz Ketchup', exact: true })).toBeVisible();
    await expect(page.getByRole('link', { name: 'Purina Dry Dog Food', exact: true })).toBeVisible();
    await expect(page.getByRole('link', { name: 'Pedigree Wet Dog Food', exact: true })).toBeVisible();
  });

  test('search filters inventory', async ({ page, waitForData, authenticate }) => {
    await authenticate();
    await page.goto('/clog/inventory');
    await waitForData(page);

    await page.getByPlaceholder('Search inventory...').fill('ketchup');
    await expect(page.getByRole('link', { name: 'Heinz Ketchup', exact: true })).toBeVisible();
    await expect(page.getByRole('link', { name: 'Purina Dry Dog Food', exact: true })).not.toBeVisible();
  });

  test('expands item row to show location breakdown', async ({ page, waitForData, authenticate }) => {
    await authenticate();
    await page.goto('/clog/inventory');
    await waitForData(page);

    await page.getByRole('button', { name: 'Show locations for Heinz Ketchup' }).click();
    await expect(page.getByRole('link', { name: 'Kitchen Cabinet', exact: true })).toBeVisible();
    await expect(page.getByRole('link', { name: 'Garage Shelves', exact: true })).toBeVisible();
  });

  test('shows no results message for empty search', async ({ page, waitForData, authenticate }) => {
    await authenticate();
    await page.goto('/clog/inventory');
    await waitForData(page);

    await page.getByPlaceholder('Search inventory...').fill('nonexistent xyz');
    await expect(page.getByText('No inventory found')).toBeVisible();
  });
});

test('location tabs, grouped details and browser history preserve workspace filters', async ({ page, authenticate }) => {
  await authenticate();
  await page.goto('/clog/inventory?term=ketchup');
  await page.getByRole('navigation', { name: 'Inventory locations' }).getByRole('button', { name: 'Kitchen Cabinet', exact: true }).click();
  await expect(page).toHaveURL(/term=ketchup&location=/);
  const filtered = page.url();
  await page.getByRole('link', { name: 'Heinz Ketchup', exact: true }).click();
  const panel = page.getByRole('complementary', { name: 'Inventory details' });
  await expect(panel.getByRole('heading', { name: 'Heinz Ketchup', exact: true })).toBeFocused();
  await expect(page).toHaveURL(/\/inventory\/items\/.*\?term=ketchup&location=/);
  await page.reload();
  await expect(panel.getByRole('heading', { name: 'Heinz Ketchup', exact: true })).toBeVisible();
  await panel.getByRole('button', { name: 'Close', exact: true }).click();
  await expect(page).toHaveURL(filtered);
  await page.getByRole('button', { name: 'Show locations for Heinz Ketchup' }).click();
  await page.getByRole('link', { name: 'Kitchen Cabinet', exact: true }).click();
  await expect(panel.getByRole('heading', { name: 'Kitchen Cabinet' })).toBeVisible();
  await page.goBack();
  await expect(page).toHaveURL(filtered);
  await expect(panel).toHaveCount(0);
  await page.getByRole('link', { name: 'Details for Heinz Ketchup' }).click();
  await expect(panel.getByText('Unit 1 of 2', { exact: true })).toBeVisible();
  await panel.getByRole('button', { name: 'Next unit' }).click();
  await expect(panel.getByText('Unit 2 of 2', { exact: true })).toBeVisible();
  await panel.getByRole('button', { name: 'Previous unit' }).click();
  await expect(panel.getByText('Unit 1 of 2', { exact: true })).toBeVisible();
  await expect(page.getByRole('table').getByRole('button', { name: /^(Add|Delete|Remove)/ })).toHaveCount(0);
});

test('workspace pages groups and physical units beyond the first page, then edits and deletes stock', async ({ page, context, authenticate }, testInfo) => {
  test.setTimeout(60_000);
  await authenticate();
  const session = await (await context.request.get('/wp-admin/admin-ajax.php?action=clog_graphql_session')).json();
  async function execute(query: string) {
    const result = await (await context.request.post('/graphql', { headers: { 'X-WP-Nonce': session.nonce }, data: { query } })).json();
    expect(result.errors).toBeUndefined(); return result.data;
  }
  const names = Array.from({ length: 26 }, (_, index) => `Clog E2E Workspace ${String(index + 1).padStart(2, '0')}`);
  const created = await execute(`mutation {
    l: createClogLocation(input: {name: "Clog E2E Workspace shelf"}) { clogLocation { id } }
    ${names.map((name, index) => `i${index}: createClogItem(input: {name: ${JSON.stringify(name)}}) { clogItem { id } }`).join('\n')}
  }`);
  const location = created.l.clogLocation.id;
  const ids: string[] = names.map((_, index) => created[`i${index}`].clogItem.id);
  try {
    await execute(`mutation { ${ids.map((item, index) => `s${index}: createClogInventory(input: {item: ${JSON.stringify(item)}, location: ${JSON.stringify(location)}, dateAdded: "2026-01-01T00:00:00Z"}) { clogInventory { id } }`).join('\n')} }`);
    await execute(`mutation { ${Array.from({ length: 104 }, (_, index) => `s${index}: createClogInventory(input: {item: ${JSON.stringify(ids[0])}, location: ${JSON.stringify(location)}, dateAdded: "2026-01-02T00:00:00Z"}) { clogInventory { id } }`).join('\n')} }`);
    const operations: string[] = [];
    page.on('request', (request) => { if (request.url().endsWith('/graphql')) operations.push(request.postDataJSON()?.operationName); });
    await page.goto('/clog/inventory?term=Clog+E2E+Workspace');
    await expect(page.getByText('26 stocked items', { exact: true })).toBeVisible();
    await expect(page.getByRole('link', { name: names[25], exact: true })).toHaveCount(0);
    await page.getByRole('button', { name: 'Load more stocked items' }).click();
    await expect(page.getByRole('link', { name: names[25], exact: true })).toBeVisible();
    await expect(page.getByRole('row').filter({ has: page.getByRole('link', { name: names[0], exact: true }) }).getByRole('cell', { name: '105', exact: true })).toBeVisible();
    await page.getByRole('button', { name: `Show locations for ${names[0]}`, exact: true }).click();
    await page.getByRole('button', { name: 'Show units at Clog E2E Workspace shelf', exact: true }).click();
    await expect(page.getByRole('table', { name: 'Physical stock units', exact: true }).getByRole('link')).toHaveCount(25);
    await page.getByRole('button', { name: 'Load more stock units', exact: true }).click();
    await expect(page.getByRole('table', { name: 'Physical stock units', exact: true }).getByRole('link')).toHaveCount(50);
    await page.getByRole('link', { name: 'Details for unit 26', exact: true }).click();
    await expect(page.getByRole('complementary').getByRole('heading', { name: 'Inventory Entry' })).toBeVisible();
    await page.getByRole('complementary').getByRole('button', { name: 'Close', exact: true }).click();
    await page.getByRole('link', { name: `Details for ${names[0]}`, exact: true }).click();
    const panel = page.getByRole('complementary', { name: 'Inventory details' });
    await expect(panel.getByText('Unit 1 of 105', { exact: true })).toBeVisible();
    for (let index = 2; index <= 26; index++) {
      await panel.getByRole('button', { name: 'Next unit' }).click();
      await expect(panel.getByText(`Unit ${index} of 105`, { exact: true })).toBeVisible();
    }
    await panel.getByRole('link', { name: 'Edit', exact: true }).click();
    await expect(panel.getByRole('heading', { name: 'Edit Inventory' })).toBeVisible();
    await panel.locator('input[type="date"]').fill('2025-12-24');
    await panel.getByRole('button', { name: 'Update', exact: true }).click();
    await expect(panel.getByText('Date Added: 12/24/2025', { exact: true })).toBeVisible();
    const detail = page.url();
    await page.reload();
    await expect(panel.getByRole('heading', { name: 'Inventory Entry' })).toBeVisible();
    page.on('dialog', (dialog) => dialog.accept());
    await panel.getByRole('button', { name: 'Delete', exact: true }).click();
    await expect(page).not.toHaveURL(detail);
    await expect(page.getByRole('row').filter({ has: page.getByRole('link', { name: names[0], exact: true }) }).getByRole('cell', { name: '104', exact: true })).toBeVisible();
    await page.getByRole('link', { name: `Details for ${names[0]}`, exact: true }).click();
    await panel.getByRole('button', { name: 'Add one here' }).click();
    await expect(panel.getByText('Unit 1 of 105', { exact: true })).toBeVisible();
    await page.getByRole('link', { name: 'Add Inventory', exact: true }).click();
    await panel.getByRole('textbox', { name: 'Find an item', exact: true }).fill(names[25]);
    await panel.getByRole('combobox', { name: 'Item', exact: true }).click();
    await page.getByRole('option', { name: names[25], exact: true }).click();
    await panel.getByRole('textbox', { name: 'Find a location', exact: true }).fill('Clog E2E Workspace shelf');
    await panel.getByRole('combobox', { name: 'Location', exact: true }).click();
    await page.getByRole('option', { name: 'Clog E2E Workspace shelf', exact: true }).click();
    await panel.getByRole('button', { name: 'Create', exact: true }).click();
    await expect(panel.getByRole('heading', { name: 'Inventory Entry' })).toBeVisible();
    await expect(panel.getByRole('link', { name: names[25], exact: true })).toBeVisible();
    expect(operations).not.toContain('GetItems');
    expect(operations).not.toContain('GetInventory');
    expect(operations).toContain('StockSelectionPagePaginationQuery');
    for (const viewport of [{ width: 390, height: 844 }, { width: 1080, height: 1920 }]) {
      await page.setViewportSize(viewport);
      await expect(panel.getByRole('heading', { name: 'Inventory Entry' })).toBeVisible();
      expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
      await page.screenshot({ path: testInfo.outputPath(`workspace-${viewport.width}.png`), fullPage: true });
    }
  } finally {
    await execute(`mutation { ${ids.map((id, index) => `d${index}: deleteClogItem(input: {id: ${JSON.stringify(id)}}) { deletedId }`).join('\n')} }`);
    await execute(`mutation { deleteClogLocation(input: {id: ${JSON.stringify(location)}}) { deletedId } }`);
  }
});

test('uncertain stock additions retain an explicit error and never replay', async ({ page, context, authenticate }) => {
  await authenticate();
  const session = await (await context.request.get('/wp-admin/admin-ajax.php?action=clog_graphql_session')).json();
  async function execute(query: string) {
    const result = await (await context.request.post('/graphql', { headers: { 'X-WP-Nonce': session.nonce }, data: { query } })).json();
    expect(result.errors).toBeUndefined(); return result.data;
  }
  const created = await execute(`mutation {
    i: createClogItem(input: {name: "Clog E2E Uncertain stock"}) { clogItem { id } }
    l: createClogLocation(input: {name: "Clog E2E Uncertain shelf"}) { clogLocation { id } }
  }`);
  const item = created.i.clogItem.id;
  const location = created.l.clogLocation.id;
  try {
    const initial = await execute(`mutation { createClogInventory(input: {item: ${JSON.stringify(item)}, location: ${JSON.stringify(location)}, dateAdded: "2026-01-01T00:00:00Z"}) { clogInventory { id } } }`);
    const id = initial.createClogInventory.clogInventory.id;
    let writes = 0;
    let release: () => void = () => {};
    const held = new Promise<void>((resolve) => { release = resolve; });
    await page.route('**/graphql', async (route) => {
      if (route.request().postDataJSON()?.operationName === 'useAddStockMutation') {
        writes++;
        await route.fetch();
        await held;
        await route.abort('failed');
      } else await route.continue();
    });
    await page.goto(`/clog/inventory/${encodeURIComponent(id)}?term=Clog+E2E+Uncertain+stock`);
    const panel = page.getByRole('complementary', { name: 'Inventory details' });
    await panel.getByRole('button', { name: 'Add one here' }).click();
    await expect(panel.getByRole('button', { name: 'Add one here' })).toBeDisabled();
    await expect.poll(() => writes).toBe(1);
    release();
    await expect(panel.getByRole('alert')).toContainText('Check inventory before retrying');
    await expect(page.getByRole('row').filter({ has: page.getByRole('link', { name: 'Clog E2E Uncertain stock', exact: true }) }).getByRole('cell', { name: '2', exact: true })).toBeVisible();
    expect(writes).toBe(1);
    await page.reload();
    await expect(panel.getByRole('heading', { name: 'Inventory Entry' })).toBeVisible();
    expect(writes).toBe(1);
  } finally {
    await execute(`mutation { deleteClogItem(input: {id: ${JSON.stringify(item)}}) { deletedId } }`);
    await execute(`mutation { deleteClogLocation(input: {id: ${JSON.stringify(location)}}) { deletedId } }`);
  }
});
