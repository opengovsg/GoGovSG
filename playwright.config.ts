import { defineConfig } from '@playwright/test'
import { rootLocation } from './test/end-to-end/util/config'

export default defineConfig({
  testDir: './test/end-to-end',
  testMatch: '**/*.spec.ts',
  // testcafe had no per-test budget at all -- only selector/assertion/page-load
  // timeouts -- so tests that were merely slow still passed. The heaviest tests
  // here run four OTP round-trips through maildev before they start asserting,
  // and WebKit runs the suite ~40% slower than Chromium.
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
    video: 'retain-on-failure',
    // Fail a stuck navigation on its own, well inside the test budget, rather
    // than letting it consume the whole thing and report as a generic timeout.
    navigationTimeout: 30_000,
  },
  projects: [
    {
      name: 'chromium',
      use: { browserName: 'chromium' },
    },
    {
      name: 'firefox',
      use: { browserName: 'firefox' },
    },
    {
      name: 'webkit',
      use: { browserName: 'webkit' },
    },
  ],
  webServer: {
    command: 'pnpm run dev',
    url: rootLocation,
    timeout: 270_000,
    reuseExistingServer: !process.env.CI,
  },
})
