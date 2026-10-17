import { test as base, expect } from '@playwright/test';
import { login } from './session';

export const test = base.extend<{
  authenticate: (username?: string) => Promise<void>;
}>({
  authenticate: async ({ context }, use) => {
    await use(async (username?: string) => {
      await login(context.request, undefined, username);
    });
  },
});

export { expect };
