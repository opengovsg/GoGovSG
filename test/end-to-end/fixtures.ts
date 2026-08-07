import { test as base, expect, Page } from '@playwright/test'
import { rootLocation } from './util/config'
import { loginProcedure } from './util/LoginProcedure'
import { gotoPage } from './util/navigation'

/**
 * Overrides the built-in `page` fixture so every test in a spec file that
 * imports `test` from here starts on an already-logged-in (default test
 * account) page, matching the testcafe suite's per-fixture
 * `.beforeEach(LoginProcedure)`.
 *
 * Spec files that need a different login email (ApiIntegration) or that
 * exercise the login flow itself (LoginPageSessions) import `test`/`expect`
 * from '@playwright/test' directly instead of from here.
 */
export const test = base.extend<{ page: Page }>({
  page: async ({ page }, runTest) => {
    await gotoPage(page, rootLocation)
    await loginProcedure(page)
    await runTest(page)
  },
})

export { expect }
