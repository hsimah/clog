import { test, expect } from './fixtures';

test('account password dialog validates, changes credentials and clears cancelled input', async ({ page, context, authenticate }) => {
  await authenticate();
  await page.goto('/');
  const open = async () => {
    await page.getByRole('button', { name: 'Account menu' }).click();
    await page.getByRole('menuitem', { name: 'Change password' }).click();
  };
  await open();
  const dialog = page.getByRole('dialog');
  const current = dialog.getByLabel(/^Current password/);
  const password = dialog.getByLabel(/^New password/);
  const confirmation = dialog.getByLabel(/^Confirm new password/);
  const submit = dialog.getByRole('button', { name: 'Change password', exact: true });
  await current.fill('wrong-password');
  await password.fill('updated-password-only');
  await confirmation.fill('mismatched-password');
  await submit.click();
  await expect(dialog.getByRole('alert')).toHaveText('New passwords do not match.');
  await confirmation.fill('updated-password-only');
  await submit.click();
  await expect(dialog.getByRole('alert')).toHaveText('Current password is incorrect.');
  await dialog.getByRole('button', { name: 'Cancel', exact: true }).click();
  await open();
  await expect(current).toHaveValue('');
  await expect(password).toHaveValue('');
  await current.fill('test-password-only');
  await password.fill('updated-password-only');
  await confirmation.fill('updated-password-only');
  try {
    await submit.click();
    await expect(dialog).toHaveCount(0);
    await expect(page.getByRole('status').filter({ hasText: 'Password changed.' })).toBeVisible();
    // The existing session remains usable; the next change requires the new credential.
    await open();
    await current.fill('updated-password-only');
    await password.fill('test-password-only');
    await confirmation.fill('test-password-only');
    await submit.click();
    await expect(dialog).toHaveCount(0);
  } finally {
    const session = await (await context.request.get('/auth/session')).json();
    await context.request.post('/graphql', {
      headers: { 'X-Clog-CSRF': session.nonce },
      data: { query: 'mutation($input:ChangeClogUserPasswordInput!){changeClogUserPassword(input:$input){clogUser{id}}}', variables: { input: { id: session.userId, currentPassword: 'updated-password-only', newPassword: 'test-password-only' } } },
    });
  }
});

test('password action is not replayed after a lost response and fits a narrow screen', async ({ page, authenticate }) => {
  await authenticate();
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/');
  await page.getByRole('button', { name: 'Account menu' }).focus();
  await page.keyboard.press('Enter');
  await page.getByRole('menuitem', { name: 'Change password' }).press('Enter');
  const dialog = page.getByRole('dialog');
  await dialog.getByLabel(/^Current password/).fill('test-password-only');
  await dialog.getByLabel(/^New password/).fill('unsent-password-only');
  await dialog.getByLabel(/^Confirm new password/).fill('unsent-password-only');
  let writes = 0;
  await page.route('**/graphql', async (route) => {
    if (route.request().postData()?.includes('changeClogUserPassword')) {
      writes++;
      await route.abort('failed');
    } else await route.continue();
  });
  await dialog.getByRole('button', { name: 'Change password', exact: true }).click();
  await expect(dialog.getByRole('alert')).toBeVisible();
  await expect(dialog.getByLabel(/^New password/)).toHaveValue('unsent-password-only');
  expect(writes).toBe(1);
  const bounds = await dialog.boundingBox();
  expect(bounds).toBeTruthy();
  expect(bounds!.x).toBeGreaterThanOrEqual(0);
  expect(bounds!.x + bounds!.width).toBeLessThanOrEqual(390);
  await dialog.getByRole('button', { name: 'Cancel', exact: true }).click();
  await expect(dialog).toHaveCount(0);
  await expect(page.getByRole('button', { name: 'Account menu' })).toBeFocused();
  expect(writes).toBe(1);
});
