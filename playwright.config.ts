import { defineConfig } from '@playwright/test'
import { rootLocation } from './test/end-to-end/util/config'
import { testUserAuthFile } from './test/end-to-end/util/auth'

const browserNames = ['chromium', 'firefox', 'webkit'] as const

export default defineConfig({
  testDir: './test/end-to-end',
  testMatch: '**/*.spec.ts',
  // Generous because WebKit runs the suite ~40% slower than Chromium.
  timeout: 90_000,
  fullyParallel: false,
  // Shared maildev inbox: parallel workers race on clearMaildevInbox() and
  // steal each other's OTPs. Serialise the suite onto one worker.
  workers: 1,
  // One retry keeps a single stall from failing the job; the reporter still
  // surfaces retried tests as flaky, so they do not go unnoticed.
  retries: process.env.CI ? 1 : 0,
  reporter: process.env.CI
    ? [['list'], ['html', { open: 'never' }]]
    : [['list']],
  use: {
    baseURL: rootLocation,
    viewport: { width: 1280, height: 800 },
    // So a failure that only reproduces in CI arrives with a trace.
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    // Not retain-on-failure: that records every test and discards the passing
    // ones, taxing the whole suite to capture the rare failure.
    video: 'on-first-retry',
    // Fail a stuck navigation on its own rather than letting it consume the
    // whole test budget and report as a generic timeout.
    navigationTimeout: 30_000,
  },
  projects: [
    // One setup project per browser: `--project=<browser>` pulls in only that
    // browser's setup, so a CI shard that installed a single browser binary
    // never tries to launch another one to log in.
    ...browserNames.map((browserName) => ({
      name: `setup-${browserName}`,
      testMatch: /auth\.setup\.ts$/,
      use: { browserName },
    })),
    ...browserNames.map((browserName) => ({
      name: browserName,
      use: { browserName, storageState: testUserAuthFile(browserName) },
      dependencies: [`setup-${browserName}`],
    })),
  ],
  webServer: {
    command: 'pnpm run dev:e2e',
    // Probe the bundle, not the root: this is the one URL that proves both that
    // Express is up and that `dist` is built and mounted. Rooting the check at
    // `/` would go green against a plain `pnpm run dev` stack, whose Express has
    // no `dist` to serve, and the suite would then fail on 404s instead.
    url: `${rootLocation}/bundle.js`,
    timeout: 270_000,
    reuseExistingServer: !process.env.CI,
  },
})
