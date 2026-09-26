import { test, expect } from './fixtures';
import { login } from './session';

test('locations own their queries and retry a failed read', async ({ page, authenticate }) => {
  await authenticate();
  const operations: string[] = [];
  let fail = true;
  await page.route('**/graphql', async (route) => {
    const operation = route.request().postDataJSON()?.operationName;
    operations.push(operation);
    if (operation === 'LocationsPageQuery' && fail) {
      fail = false;
      await route.fulfill({ json: { errors: [{ message: 'Temporary query failure' }] } });
    } else await route.continue();
  });
  await page.goto('/clog/locations');
  await expect(page.getByRole('alert')).toHaveText('Temporary query failure');
  await page.getByRole('button', { name: 'Try again' }).click();
  await expect(page.getByRole('link', { name: 'Garage Shelves' })).toBeVisible();
  expect(operations.every((operation) => operation === 'LocationsPageQuery')).toBe(true);
});

test('locations paginate and raw detail links resolve off-page records', async ({ page, context, authenticate }) => {
  await authenticate();
  const session = await (await context.request.get('/wp-admin/admin-ajax.php?action=clog_graphql_session')).json();
  const names = Array.from({ length: 26 }, (_, index) => `Clog E2E Relay page ${String(index + 1).padStart(2, '0')}`);
  const response = await context.request.post('/graphql', {
    headers: { 'X-WP-Nonce': session.nonce },
    data: { query: `mutation { ${names.map((name, index) => `l${index}: createClogLocation(input: {name: ${JSON.stringify(name)}}) { clogLocation { id databaseId } }`).join('\n')} }` },
  });
  const body = await response.json();
  expect(body.errors).toBeUndefined();
  const last = body.data.l25.clogLocation;
  await page.goto('/clog/locations');
  await page.getByLabel('Search locations', { exact: true }).fill('Clog E2E Relay page');
  await expect(page.getByText('26 locations', { exact: true })).toBeVisible();
  await expect(page.getByRole('link', { name: names[25] })).toHaveCount(0);
  await page.getByRole('button', { name: 'Load more locations' }).click();
  await expect(page.getByRole('link', { name: names[25] })).toBeVisible();
  await expect(page.getByRole('button', { name: 'Load more locations' })).toHaveCount(0);
  await page.goto(`/clog/locations/${last.databaseId}`);
  await expect(page.getByRole('heading', { name: names[25] })).toBeVisible();
});

test('location mutation updates, delete and legacy route return stay fresh', async ({ page, authenticate }) => {
  await authenticate();
  await page.goto('/clog/locations/new');
  await page.getByRole('textbox', { name: /^Name/ }).fill('Clog E2E Relay create');
  await page.getByRole('button', { name: 'Create', exact: true }).click();
  await expect(page.getByRole('heading', { name: 'Clog E2E Relay create' })).toBeVisible();
  await page.getByRole('link', { name: 'Edit', exact: true }).click();
  await page.getByRole('textbox', { name: /^Name/ }).fill('Clog E2E Relay renamed');
  await page.getByRole('button', { name: 'Update', exact: true }).click();
  await expect(page.getByRole('heading', { name: 'Clog E2E Relay renamed' })).toBeVisible();
  const detailURL = page.url();
  await page.getByRole('navigation').getByRole('link', { name: 'Items', exact: true }).click();
  await expect(page.getByText('Heinz Ketchup', { exact: true })).toBeVisible();
  await page.goBack();
  await expect(page).toHaveURL(detailURL);
  await expect(page.getByRole('heading', { name: 'Clog E2E Relay renamed' })).toBeVisible();
  page.on('dialog', (dialog) => dialog.accept());
  await page.getByRole('button', { name: 'Delete', exact: true }).click();
  await expect(page).toHaveURL(/\/clog\/locations$/);
  await page.getByLabel('Search locations', { exact: true }).fill('Clog E2E Relay renamed');
  await expect(page.getByText('No locations found')).toBeVisible();
});

test('Relay preserves draft on expiry, never replays a lost write, and clears on account switch', async ({ page, context, authenticate }) => {
  await authenticate();
  await page.goto('/clog/locations/new');
  await page.getByRole('textbox', { name: /^Name/ }).fill('Clog E2E Relay uncertain');
  await context.clearCookies();
  await page.evaluate(() => window.dispatchEvent(new Event('focus')));
  await expect(page.getByRole('heading', { name: 'Sign in to continue' })).toBeVisible();
  await login(context.request);
  await page.getByRole('button', { name: 'Check session' }).click();
  await expect(page.getByRole('textbox', { name: /^Name/ })).toHaveValue('Clog E2E Relay uncertain');
  let writes = 0;
  await page.route('**/graphql', async (route) => {
    if (route.request().postDataJSON()?.operationName === 'LocationFormCreateMutation') {
      writes++;
      await route.fetch();
      await route.abort('failed');
    } else await route.continue();
  });
  await page.getByRole('button', { name: 'Create', exact: true }).click();
  await expect(page.getByRole('alert')).toContainText('Check inventory before retrying');
  await expect(page.getByRole('textbox', { name: /^Name/ })).toHaveValue('Clog E2E Relay uncertain');
  expect(writes).toBe(1);
  await page.route('**/admin-ajax.php?action=clog_graphql_session', (route) => route.fulfill({ json: { userId: 'different-user', nonce: 'changed', canWrite: false } }));
  await page.evaluate(() => window.dispatchEvent(new Event('focus')));
  await expect(page.getByRole('heading', { name: 'Session ended' })).toBeVisible();
  await expect(page.getByRole('textbox', { name: /^Name/ })).toHaveCount(0);
  expect(await page.evaluate(async () => {
    const moduleURL = '/clog/src/relay/environment.ts';
    const { environment } = await import(moduleURL);
    return environment.getStore().getSource().getRecordIDs().length;
  })).toBe(0);
});

test('leaving a Relay route aborts its pending query', async ({ page, authenticate }) => {
  await authenticate();
  await page.route('**/graphql', async (route) => {
    if (route.request().postDataJSON()?.operationName !== 'LocationsPageQuery') await route.continue();
    // Hold this response so the route is left while its query is in flight.
  });
  const request = page.waitForRequest((req) => req.postData()?.includes('LocationsPageQuery') ?? false);
  await page.goto('/clog/locations');
  await request;
  const aborted = page.waitForEvent('requestfailed', { predicate: (req) => req.postData()?.includes('LocationsPageQuery') ?? false });
  await page.getByRole('navigation').getByRole('link', { name: 'Home', exact: true }).click();
  await aborted;
  await expect(page).toHaveURL(/\/clog\/home$/);
});

test('WordPress serves Relay location deep links after reload', async ({ page, context }, testInfo) => {
  const base = process.env.WP_SHELL_URL || new URL(process.env.VITE_GRAPHQL_URL || 'http://localhost:8080').origin;
  await login(context.request, base);
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto(`${base}/clog/locations`);
  await page.getByLabel('Search locations', { exact: true }).fill('Garage Shelves');
  await page.getByRole('link', { name: 'Garage Shelves', exact: true }).click();
  await page.reload();
  await expect(page.getByRole('heading', { name: 'Garage Shelves', exact: true })).toBeFocused();
  await expect(page.getByRole('heading', { name: 'Garage Shelves', exact: true })).toBeInViewport();
  await expect(page.getByRole('button', { name: 'Delete', exact: true })).toBeDisabled();
  await page.screenshot({ path: testInfo.outputPath('location-phone.png'), fullPage: true });
});
