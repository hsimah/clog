import { defineConfig } from '@playwright/test';
export default defineConfig({
  testDir: './standalone-e2e',
  workers: 1,
  retries: 0,
  reporter: 'list',
  use: { baseURL: process.env.CLOG_TEST_URL || 'http://127.0.0.1:8280', browserName: 'chromium', trace: 'retain-on-failure' },
});
