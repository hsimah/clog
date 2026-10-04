import { test as base, expect } from '@playwright/test';
import { login } from './session';

export const test = base.extend<{
  waitForData: (page?: import('@playwright/test').Page) => Promise<void>;
  authenticate: (username?: string) => Promise<void>;
}>({
  waitForData: async ({}, use) => {
    await use(async (page) => {
      if (!page) return;
      await expect(page.getByText('Loading...', { exact: true })).toHaveCount(0);
    });
  },

  authenticate: async ({ context }, use) => {
    await use(async (username?: string) => {
      await login(context.request, undefined, username);
    });
  },
});

export { expect };
