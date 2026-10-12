import { defineConfig } from '@playwright/test';
import nextEnv from '@next/env';

nextEnv.loadEnvConfig(process.cwd());

const port = Number(process.env.PLAYWRIGHT_PORT ?? process.env.PORT ?? 4173);
const baseURL = process.env.PLAYWRIGHT_BASE_URL ?? `http://127.0.0.1:${port}`;

export default defineConfig({
  testDir: './tests/e2e',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: 'list',
  use: {
    baseURL,
    trace: 'on-first-retry',
  },
  projects: [
    {
      name: 'Mobile (390x844)',
      use: {
        viewport: { width: 390, height: 844 },
      },
    },
    {
      name: 'Tablet (768x1024)',
      use: {
        viewport: { width: 768, height: 1024 },
      },
    },
    {
      name: 'Desktop (1280x800)',
      use: {
        viewport: { width: 1280, height: 800 },
      },
    },
  ],
  webServer: {
    command: `npm run dev -- -p ${port}`,
    port,
    reuseExistingServer: !process.env.CI,
  },
});
