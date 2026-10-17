import { test, expect } from './fixtures';
import { login } from './session';

test('administrator adds a user, resets their password and deletes them', async ({ page, authenticate }) => {
  const errors: string[] = [];
  page.on('pageerror', error => errors.push(error.message));
  await authenticate('admin');
  await page.goto('/');
  await page.getByRole('button', { name: 'Account menu' }).click();
  await page.getByRole('menuitem', { name: 'Manage users' }).click();
  await expect(page).toHaveURL(/\/users$/);
  await expect(page.getByRole('heading', { name: 'Users', level: 1 })).toBeVisible();
  await expect(page.getByRole('row').filter({ hasText: 'admin' })).toContainText('Editor, administrator');

  // Administrators cannot reset or delete themselves here.
  await page.getByRole('link', { name: 'admin', exact: true }).click();
  const panel = page.getByRole('complementary', { name: 'User details' });
  await expect(panel.getByText('This is your account.', { exact: false })).toBeVisible();
  await expect(panel.getByRole('button', { name: 'Delete user' })).toBeDisabled();

  const username = `e2e-helper-${Date.now()}`;
  await page.getByRole('link', { name: 'Add User' }).click();
  await expect(page).toHaveURL(/\/users\/new$/);
  await expect(panel.getByLabel(/^Username/)).toBeFocused();
  await panel.getByLabel(/^Username/).fill(username);
  await panel.getByLabel(/^Password/).fill('initial-password-only');
  await panel.getByLabel(/^Confirm password/).fill('mismatched-password');
  await panel.getByRole('button', { name: 'Create user' }).click();
  await expect(panel.getByRole('alert')).toHaveText('Passwords do not match.');
  await panel.getByLabel(/^Confirm password/).fill('initial-password-only');
  await panel.getByRole('radio', { name: 'Editor' }).check();
  await panel.getByRole('button', { name: 'Create user' }).click();
  await expect(panel.getByRole('heading', { name: username })).toBeVisible();
  await expect(panel.getByText('Access: Editor', { exact: true })).toBeVisible();
  await expect(page.getByRole('row').filter({ hasText: username })).toBeVisible();

  // http.php covers the sessions a reset or deletion ends; this covers the panel flow.
  await panel.getByLabel(/^New password/).fill('test-password-only');
  await panel.getByLabel(/^Confirm new password/).fill('test-password-only');
  await panel.getByRole('button', { name: 'Reset password' }).click();
  await expect(panel.getByRole('status').filter({ hasText: 'Password reset' })).toHaveText(`Password reset for ${username}. They have been signed out.`);
  await expect(panel.getByLabel(/^New password/)).toHaveValue('');
  page.once('dialog', dialog => dialog.accept());
  await panel.getByRole('button', { name: 'Delete user' }).click();
  await expect(page).toHaveURL(/\/users$/);
  await expect(page.getByRole('row').filter({ hasText: username })).toHaveCount(0);
  expect(errors).toEqual([]);
});

test('non-administrators cannot reach user management', async ({ page, authenticate }) => {
  await authenticate();
  await page.goto('/');
  await page.getByRole('button', { name: 'Account menu' }).click();
  await expect(page.getByRole('menuitem', { name: 'Change password' })).toBeVisible();
  await expect(page.getByRole('menuitem', { name: 'Manage users' })).toHaveCount(0);
  await page.keyboard.press('Escape');
  await page.goto('/users/1');
  await expect(page.getByText('Administrator access is required to manage users.')).toBeVisible();
  await expect(page.getByRole('complementary', { name: 'User details' })).toHaveCount(0);
});

test('administrator drafts survive suspension and session expiry', async ({ page, context, authenticate }) => {
  await authenticate('admin');
  await page.goto('/users');
  const panel = page.getByRole('complementary', { name: 'User details' });

  // Leaving the tab suspends the session until it is checked again.
  await page.getByRole('link', { name: 'editor', exact: true }).click();
  await expect(panel.getByRole('heading', { name: 'editor' })).toBeFocused();
  await panel.getByLabel(/^New password/).fill('unsubmitted-password');
  await page.evaluate(() => window.dispatchEvent(new Event('pagehide')));
  await expect(panel.getByLabel(/^New password/)).toBeHidden();
  await page.evaluate(() => window.dispatchEvent(new Event('focus')));
  await expect(panel.getByLabel(/^New password/)).toHaveValue('unsubmitted-password');
  await context.clearCookies();
  await page.evaluate(() => window.dispatchEvent(new Event('focus')));
  await expect(page.getByRole('heading', { name: 'Sign in to continue' })).toBeVisible();
  await login(context.request, undefined, 'admin');
  await page.getByRole('button', { name: 'Check session' }).click();
  await expect(panel.getByLabel(/^New password/)).toHaveValue('unsubmitted-password');
});
