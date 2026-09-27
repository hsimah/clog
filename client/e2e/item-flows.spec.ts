import { test, expect } from './fixtures';

// All new fixtures keep the teardown prefix; these are distinct from the seed inventory.
test('initial stock reports partial completion without recreating the saved item', async ({ page, authenticate }) => {
  await authenticate();
  let items = 0;
  let additions = 0;
  await page.route('**/graphql', async (route) => {
    const operation = route.request().postDataJSON()?.operationName;
    if (operation === 'useItemFormCreateMutation') items++;
    if (operation === 'useAddStockMutation') {
      additions++;
      if (additions === 2) {
        await route.fetch(); // Commit the second unit, then lose its acknowledgement.
        await route.abort('failed');
        return;
      }
    }
    await route.continue();
  });
  await page.goto('/items/new');
  await page.getByRole('textbox', { name: /^Name/ }).fill('Clog E2E Partial stock');
  await page.getByLabel('Count', { exact: true }).fill('3');
  await page.getByRole('textbox', { name: /^Name/ }).click(); // Commit the numeric input.
  await page.getByRole('combobox', { name: 'Location', exact: true }).click();
  await page.getByRole('option', { name: 'Garage Shelves', exact: true }).click();
  await page.getByRole('button', { name: 'Create', exact: true }).click();
  await expect(page.getByText('Item saved. 1 of 3 initial stock additions confirmed.')).toBeVisible();
  await expect(page.getByRole('alert').filter({ hasText: 'Check inventory before retrying' })).toContainText('Check inventory before retrying');
  await expect(page.getByRole('button', { name: 'Create', exact: true })).toBeDisabled();
  expect(items).toBe(1);
  expect(additions).toBe(2);
  await page.getByRole('link', { name: 'Review saved item' }).click();
  await expect(page.getByRole('heading', { name: 'Clog E2E Partial stock' })).toBeVisible();
  await expect(page.getByRole('complementary').getByText('2 stocked units', { exact: true })).toBeVisible();
});

test('barcodes preserve leading zeroes, report duplicates, and clear to null', async ({ page, authenticate }) => {
  await authenticate();
  await page.goto('/items/new');
  await page.getByRole('textbox', { name: /^Name/ }).fill('Clog E2E Leading zero');
  await page.getByPlaceholder('Enter barcode').fill('0000420099');
  await page.getByRole('button', { name: 'Create', exact: true }).click();
  await expect(page.getByRole('heading', { name: 'Clog E2E Leading zero' })).toBeVisible();
  const detail = page.url();
  await expect(page.getByRole('complementary')).toContainText('0000420099');
  await page.goto('/items/new');
  await page.getByRole('textbox', { name: /^Name/ }).fill('Clog E2E Duplicate barcode');
  await page.getByPlaceholder('Enter barcode').fill('0000420099');
  await page.getByRole('button', { name: 'Create', exact: true }).click();
  await expect(page.getByRole('alert').filter({ hasText: 'Check inventory before retrying' })).toBeVisible();
  await expect(page.getByPlaceholder('Enter barcode')).toHaveValue('0000420099');
  await page.goto(`${detail}/edit`);
  await page.getByPlaceholder('Enter barcode').fill('');
  await page.getByRole('button', { name: 'Update', exact: true }).click();
  await expect(page.getByRole('complementary')).toContainText('Barcode: None');
});

test('denied camera access offers manual barcode entry', async ({ page, authenticate }) => {
  await authenticate();
  await page.addInitScript(() => {
    Object.defineProperty(navigator, 'mediaDevices', { configurable: true, value: {
      getUserMedia: async () => { throw new DOMException('Permission denied', 'NotAllowedError'); },
    } });
  });
  await page.goto('/items/new');
  await page.getByRole('button', { name: 'Scan barcode', exact: true }).click();
  await expect(page.getByRole('dialog').getByRole('alert')).toContainText('manually');
  await page.getByRole('textbox', { name: 'Manual barcode', exact: true }).fill('0000012345');
  await page.getByRole('button', { name: 'Use barcode', exact: true }).click();
  await expect(page.getByRole('dialog')).toHaveCount(0);
  await expect(page.getByPlaceholder('Enter barcode')).toHaveValue('0000012345');
});

for (const mode of ['detect', 'late', 'expire']) {
  const delayed = mode === 'late';
  test(`scanner cleans streams: ${mode}`, async ({ page, context, authenticate }) => {
    await authenticate();
    await page.addInitScript((mode) => {
      const state = { opened: 0, stopped: 0, release: () => {} };
      Object.assign(window, { scannerTest: state });
      Object.defineProperty(HTMLMediaElement.prototype, 'readyState', { get: () => 2 });
      HTMLMediaElement.prototype.play = async () => {};
      Object.defineProperty(window, 'BarcodeDetector', { value: class {
        static async getSupportedFormats() { return ['ean_13']; }
        async detect() { return mode === 'detect' ? [{ rawValue: '0000076543' }] : []; }
      }, configurable: true });
      const gate = new Promise<void>((resolve) => { state.release = resolve; });
      Object.defineProperty(navigator, 'mediaDevices', { configurable: true, value: { getUserMedia: async () => {
        state.opened++;
        const stream = document.createElement('canvas').captureStream();
        for (const track of stream.getTracks()) {
          const stop = track.stop.bind(track);
          track.stop = () => { state.stopped++; stop(); };
        }
        if (mode === 'late') await gate;
        return stream;
      } } });
    }, mode);
    await page.goto('/items/new');
    await page.getByRole('button', { name: 'Scan barcode', exact: true }).click();
    if (delayed) {
      await expect.poll(() => page.evaluate(() => (window as unknown as { scannerTest: { opened: number } }).scannerTest.opened)).toBeGreaterThan(0);
      await page.getByRole('dialog').getByRole('button', { name: 'Cancel', exact: true }).click();
      await page.evaluate(() => (window as unknown as { scannerTest: { release: () => void } }).scannerTest.release());
    } else if (mode === 'expire') {
      await expect(page.getByRole('button', { name: 'Capture', exact: true })).toBeEnabled();
      await context.clearCookies();
      await page.evaluate(() => window.dispatchEvent(new Event('focus')));
      await expect(page.getByRole('heading', { name: 'Sign in to continue' })).toBeVisible();
    } else {
      await expect(page.getByPlaceholder('Enter barcode')).toHaveValue('0000076543');
    }
    await expect(page.getByRole('dialog')).toHaveCount(0);
    await expect.poll(() => page.evaluate(() => {
      const state = (window as unknown as { scannerTest: { opened: number; stopped: number } }).scannerTest;
      return state.opened > 0 && state.opened === state.stopped;
    })).toBe(true);
  });
}

test('initial stock can select a location beyond the first page', async ({ page, context, authenticate }) => {
  await authenticate();
  const session = await (await context.request.get('/auth/session')).json();
  const names = Array.from({ length: 26 }, (_, index) => `Clog E2E Picker ${String(index + 1).padStart(2, '0')}`);
  const response = await context.request.post('/graphql', {
    headers: { 'X-Clog-CSRF': session.nonce },
    data: { query: `mutation { ${names.map((name, index) => `l${index}: createClogLocation(input: {name: ${JSON.stringify(name)}}) { clogLocation { id } }`).join('\n')} }` },
  });
  const body = await response.json();
  expect(body.errors).toBeUndefined();
  const ids = Object.values(body.data as Record<string, { clogLocation: { id: string } }>).map((entry) => entry.clogLocation.id);
  let itemId: string | undefined;
  try {
  await page.goto('/items/new');
  await page.getByRole('textbox', { name: /^Name/ }).fill('Clog E2E Off-page initial stock');
  await page.getByLabel('Count', { exact: true }).fill('1');
  await page.getByRole('textbox', { name: /^Name/ }).click();
  await page.getByRole('textbox', { name: 'Find a location', exact: true }).fill(names[25]);
  await page.getByRole('combobox', { name: 'Location', exact: true }).click();
  await page.getByRole('option', { name: names[25], exact: true }).click();
  await page.getByRole('button', { name: 'Create', exact: true }).click();
  await expect(page.getByRole('heading', { name: 'Clog E2E Off-page initial stock' })).toBeVisible();
  await expect(page.getByRole('complementary').getByText('1 stocked units', { exact: true })).toBeVisible();
  itemId = decodeURIComponent(new URL(page.url()).pathname.split('/').pop()!);
  } finally {
    const cleanup = await context.request.post('/graphql', {
      headers: { 'X-Clog-CSRF': session.nonce },
      data: { query: `mutation { ${itemId ? `item: deleteClogItem(input: {id: ${JSON.stringify(itemId)}}) { deletedId }` : ''} ${ids.map((id, index) => `l${index}: deleteClogLocation(input: {id: ${JSON.stringify(id)}}) { deletedId }`).join(' ')} }` },
    });
    expect((await cleanup.json()).errors).toBeUndefined();
  }
});
