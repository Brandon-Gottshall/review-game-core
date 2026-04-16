import { defineConfig } from '@playwright/test'

export default defineConfig({
  testDir: './tests',
  testMatch: '**/*.browser.spec.ts',
  timeout: 30_000,
  use: {
    baseURL: 'http://127.0.0.1:3210',
    trace: 'on-first-retry',
  },
  webServer: {
    command: 'npm run dev -- --port 3210',
    url: 'http://127.0.0.1:3210',
    reuseExistingServer: true,
  },
})
