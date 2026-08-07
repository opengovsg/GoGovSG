import { defineConfig } from '@playwright/test'
import { rootLocation, userAuthFile } from './test/end-to-end/util/config'

const browsers = ['chromium', 'firefox', 'webkit'] as const

export default defineConfig({
  testDir: './test/end-to-end',
  timeout: 60_000,
  fullyParallel: false,
  // Shared maildev inbox: parallel workers race on clearMaildevInbox() and
  // steal each other's OTPs. Serialise the suite onto one worker.
  workers: 1,
  retries: 0,
  reporter: 'list',
  use: {
    baseURL: rootLocation,
    viewport: { width: 1280, height: 800 },
    trace: 'off',
  },
  projects: browsers.flatMap((browserName) => [
    {
      name: `setup-${browserName}`,
      testMatch: /auth\.setup\.ts/,
      use: { browserName },
    },
    {
      name: browserName,
      testMatch: /.*\.spec\.ts/,
      use: {
        browserName,
        storageState: userAuthFile(browserName),
      },
      dependencies: [`setup-${browserName}`],
    },
  ]),
  webServer: {
    // Production webpack/tsc build served by Express (no webpack-dev-server).
    // Server stays on NODE_ENV=development for local HTTP cookies + maildev.
    command: 'pnpm run dev:e2e',
    url: rootLocation,
    timeout: 270_000,
    reuseExistingServer: !process.env.CI,
  },
})
