import { test, expect } from './fixtures';
import { login } from './session';

test('locations own their queries and retry a failed read', async ({ page, authenticate }) => {
  await authenticate();
  const operations: string[] = [];
  let fail = true;
  await page.route('**/graphql', async (route) => {
    const operation = route.request().postDataJSON()?.operationName;
    operations.push(operation);
    if (operation === 'LocationPageQuery' && fail) {
      fail = false;
      await route.fulfill({ json: { errors: [{ message: 'Temporary query failure' }] } });
    } else await route.continue();
  });
  await page.goto('/locations');
  await expect(page.getByRole('alert')).toHaveText('Temporary query failure');
  await page.getByRole('button', { name: 'Try again' }).click();
  await expect(page.getByRole('link', { name: 'Garage Shelves' })).toBeVisible();
  expect(operations.every((operation) => operation === 'LocationPageQuery')).toBe(true);
});

test('locations paginate and raw detail links resolve off-page records', async ({ page, context, authenticate }) => {
  await authenticate();
  const session = await (await context.request.get('/auth/session')).json();
  const names = Array.from({ length: 26 }, (_, index) => `Clog E2E Relay page ${String(index + 1).padStart(2, '0')}`);
  const response = await context.request.post('/graphql', {
    headers: { 'X-Clog-CSRF': session.nonce },
    data: { query: `mutation { ${names.map((name, index) => `l${index}: createClogLocation(input: {name: ${JSON.stringify(name)}}) { clogLocation { id databaseId } }`).join('\n')} }` },
  });
  const body = await response.json();
  expect(body.errors).toBeUndefined();
  const last = body.data.l25.clogLocation;
  await page.goto('/locations');
  await page.getByLabel('Search locations', { exact: true }).fill('Clog E2E Relay page');
  await expect(page.getByText('26 locations', { exact: true })).toBeVisible();
  await expect(page.getByRole('link', { name: names[25] })).toHaveCount(0);
  await page.getByRole('button', { name: 'Load more locations' }).click();
  await expect(page.getByRole('link', { name: names[25] })).toBeVisible();
  await expect(page.getByRole('button', { name: 'Load more locations' })).toHaveCount(0);
  await page.goto(`/locations/${last.databaseId}`);
  await expect(page.getByRole('heading', { name: names[25] })).toBeVisible();
});

test('location mutation updates, delete and legacy route return stay fresh', async ({ page, authenticate }) => {
  await authenticate();
  await page.goto('/locations/new');
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
  await expect(page).toHaveURL(/\/locations$/);
  await page.getByLabel('Search locations', { exact: true }).fill('Clog E2E Relay renamed');
  await expect(page.getByText('No locations found')).toBeVisible();
});

test('Relay preserves draft on expiry, never replays a lost write, and clears on account switch', async ({ page, context, authenticate }) => {
  await authenticate();
  await page.goto('/locations/new');
  await page.getByRole('textbox', { name: /^Name/ }).fill('Clog E2E Relay uncertain');
  await context.clearCookies();
  await page.evaluate(() => window.dispatchEvent(new Event('focus')));
  await expect(page.getByRole('heading', { name: 'Sign in to continue' })).toBeVisible();
  await login(context.request);
  await page.getByRole('button', { name: 'Check session' }).click();
  await expect(page.getByRole('textbox', { name: /^Name/ })).toHaveValue('Clog E2E Relay uncertain');
  let writes = 0;
  await page.route('**/graphql', async (route) => {
    if (route.request().postDataJSON()?.operationName === 'useLocationFormCreateMutation') {
      writes++;
      await route.fetch();
      await route.abort('failed');
    } else await route.continue();
  });
  await page.getByRole('button', { name: 'Create', exact: true }).click();
  await expect(page.getByRole('alert').filter({ hasText: 'Check inventory before retrying' })).toContainText('Check inventory before retrying');
  await expect(page.getByRole('textbox', { name: /^Name/ })).toHaveValue('Clog E2E Relay uncertain');
  expect(writes).toBe(1);
  await page.route('**/auth/session', (route) => route.fulfill({ json: { userId: 'different-user', nonce: 'changed', canWrite: false } }));
  await page.evaluate(() => window.dispatchEvent(new Event('focus')));
  await expect(page.getByRole('heading', { name: 'Session ended' })).toBeVisible();
  await expect(page.getByRole('textbox', { name: /^Name/ })).toHaveCount(0);
  await expect(page.getByRole('navigation')).toHaveCount(0);
});

test('leaving a Relay route aborts its pending query', async ({ page, authenticate }) => {
  await authenticate();
  await page.route('**/graphql', async (route) => {
    if (route.request().postDataJSON()?.operationName !== 'LocationPageQuery') await route.continue();
    // Hold this response so the route is left while its query is in flight.
  });
  const request = page.waitForRequest((req) => req.postData()?.includes('LocationPageQuery') ?? false);
  await page.goto('/locations');
  await request;
  const aborted = page.waitForEvent('requestfailed', { predicate: (req) => req.postData()?.includes('LocationPageQuery') ?? false });
  await page.getByRole('navigation').getByRole('link', { name: 'Overview', exact: true }).click();
  await aborted;
  await expect(page).toHaveURL(/\/$/);
});

test('Standalone PHP serves Relay location deep links after reload', async ({ page, context }, testInfo) => {
  const base = process.env.CLOG_TEST_URL || 'http://127.0.0.1:8280';
  await login(context.request, base);
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto(`${base}/locations`);
  await page.getByLabel('Search locations', { exact: true }).fill('Garage Shelves');
  await page.getByRole('link', { name: 'Garage Shelves', exact: true }).click();
  await page.reload();
  await expect(page.getByRole('heading', { name: 'Garage Shelves', exact: true })).toBeFocused();
  await expect(page.getByRole('heading', { name: 'Garage Shelves', exact: true })).toBeInViewport();
  await expect(page.getByRole('button', { name: 'Delete', exact: true })).toBeDisabled();
  await page.screenshot({ path: testInfo.outputPath('location-phone.png'), fullPage: true });
});
