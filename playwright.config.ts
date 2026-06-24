import { defineConfig, devices } from '@playwright/test'

const WP_URL = process.env['PLAYWRIGHT_BASE_URL'] ?? process.env['WP_URL'] ?? 'http://localhost:8080'

export default defineConfig({
  testDir: './e2e',
  fullyParallel: true,
  forbidOnly: !!process.env['CI'],
  retries: process.env['CI'] ? 2 : 0,
  workers: process.env['CI'] ? 1 : undefined,
  reporter: [['html', { open: 'never' }]],

  use: {
    baseURL:      WP_URL,
    trace:        'on-first-retry',
    screenshot:   'only-on-failure',
    storageState: 'e2e/.auth/admin.json',
  },

  projects: [
    // Auth setup runs first
    {
      name: 'setup',
      testMatch: /global\.setup\.ts/,
    },
    {
      name: 'chromium',
      use:  { ...devices['Desktop Chrome'] },
      dependencies: ['setup'],
    },
  ],
})
