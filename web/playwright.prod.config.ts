import { defineConfig } from '@playwright/test';

// Smoke test terhadap PRODUKSI (workers.dev), bukan server lokal.
// Jalankan: npx playwright test --config playwright.prod.config.ts
const BASE_URL = process.env.PROD_URL || 'https://desa.web-jatirejoyoso.workers.dev';

export default defineConfig({
  testDir: './tests/e2e',
  timeout: 60_000,
  fullyParallel: true,
  retries: 0,
  reporter: [['list']],
  use: {
    baseURL: BASE_URL,
    trace: 'retain-on-failure',
  },
  projects: [
    {
      name: 'chromium',
      use: {
        browserName: 'chromium',
        viewport: { width: 1366, height: 768 },
        hasTouch: true,
      },
    },
    {
      name: 'mobile-chrome',
      use: {
        browserName: 'chromium',
        viewport: { width: 412, height: 915 },
        hasTouch: true,
        isMobile: true,
        deviceScaleFactor: 2.625,
        userAgent:
          'Mozilla/5.0 (Linux; Android 10; Pixel 7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125 Mobile Safari/537.36',
      },
    },
  ],
});
