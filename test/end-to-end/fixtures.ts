import { test as base, expect, Page } from '@playwright/test'
import { rootLocation } from './util/config'
import { loginProcedure } from './util/LoginProcedure'
import { blockAnalytics, gotoPage } from './util/navigation'

/**
 * Bare `page`, minus third-party analytics. Spec files that need a different
 * login email (ApiIntegration) or that exercise the login flow itself
 * (LoginPageSessions) import this instead of `test` below, so they still start
 * logged out but do not pay for analytics requests on every navigation.
 */
export const anonymousTest = base.extend<{ page: Page }>({
  page: async ({ page }, runTest) => {
    await blockAnalytics(page)
    await runTest(page)
  },
})

/**
 * Overrides the built-in `page` fixture so every test in a spec file that
 * imports `test` from here starts on an already-logged-in (default test
 * account) page, matching the testcafe suite's per-fixture
 * `.beforeEach(LoginProcedure)`.
 */
export const test = anonymousTest.extend<{ page: Page }>({
  page: async ({ page }, runTest) => {
    await gotoPage(page, rootLocation)
    await loginProcedure(page)
    await runTest(page)
  },
})

export { expect }
