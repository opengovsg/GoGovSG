import { test as base, expect, Page } from '@playwright/test'
import { rootLocation } from './util/config'
import { gotoPage } from './util/navigation'

/**
 * Overrides the built-in `page` fixture so every test in a spec file that
 * imports `test` from here starts on an already-logged-in (default test
 * account) page. Session cookies come from `auth.setup.ts` via project
 * `storageState`; this fixture only navigates to the app root.
 *
 * Spec files that need a different login email (ApiIntegration) or that
 * exercise the login flow itself (LoginPageSessions) import `test`/`expect`
 * from '@playwright/test' directly and clear storage state with
 * `emptyStorageState`.
 */
export const test = base.extend<{ page: Page }>({
  page: async ({ page }, runTest) => {
    await gotoPage(page, rootLocation)
    await runTest(page)
  },
})

export { expect }
