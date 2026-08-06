import { defineConfig } from '@playwright/test'
import { rootLocation } from './test/end-to-end/util/config'

export default defineConfig({
  testDir: './test/end-to-end',
  testMatch: '**/*.spec.ts',
  timeout: 60_000,
  fullyParallel: false,
  retries: 0,
  reporter: 'list',
  use: {
    baseURL: rootLocation,
    viewport: { width: 1280, height: 800 },
    trace: 'off',
  },
  projects: [
    {
      name: 'chromium',
      use: { browserName: 'chromium' },
    },
  ],
  webServer: {
    command: 'pnpm run dev',
    url: rootLocation,
    timeout: 270_000,
    reuseExistingServer: !process.env.CI,
  },
})
