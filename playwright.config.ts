import { defineConfig } from '@playwright/test'
import { rootLocation } from './test/end-to-end/util/config'
import { testUserAuthFile } from './test/end-to-end/util/auth'

const browserNames = ['chromium', 'firefox', 'webkit'] as const

export default defineConfig({
  testDir: './test/end-to-end',
  testMatch: '**/*.spec.ts',
  // testcafe had no per-test budget at all -- only selector/assertion/page-load
  // timeouts -- so tests that were merely slow still passed. WebKit runs the
  // suite ~40% slower than Chromium.
  timeout: 90_000,
  fullyParallel: false,
  // Shared maildev inbox: parallel workers race on clearMaildevInbox() and
  // steal each other's OTPs. Serialise the suite onto one worker.
  workers: 1,
  // A full-stack suite driving a docker-compose stack has an irreducible flake
  // floor. One retry keeps a single stall from failing the job; the reporter
  // still surfaces retried tests as flaky, so they do not go unnoticed.
  retries: process.env.CI ? 1 : 0,
  reporter: process.env.CI
    ? [['list'], ['html', { open: 'never' }]]
    : [['list']],
  use: {
    baseURL: rootLocation,
    viewport: { width: 1280, height: 800 },
    // Diagnostics for the retry, so a failure that only reproduces in CI
    // arrives with a trace instead of just a stack.
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    // on-first-retry, not retain-on-failure: the latter records every test and
    // throws the passing ones away, which taxes the whole suite to capture the
    // rare failure.
    video: 'on-first-retry',
    // Fail a stuck navigation on its own, well inside the test budget, rather
    // than letting it consume the whole thing and report as a generic timeout.
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
    command: 'pnpm run dev',
    url: rootLocation,
    timeout: 270_000,
    reuseExistingServer: !process.env.CI,
  },
})
