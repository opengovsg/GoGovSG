import { test as base, expect, Page } from '@playwright/test'
import { rootLocation } from './util/config'
import { userModal, userModalCloseButton } from './util/helpers'

/**
 * Logged-in session comes from auth.setup.ts via project storageState.
 * Specs that need a blank or alternate session (ApiIntegration,
 * LoginPageSessions) import from '@playwright/test' and call test.use()
 * to clear storageState.
 */
export const test = base.extend<{ page: Page }>({
  page: async ({ page }, runTest) => {
    await page.goto(rootLocation)
    if ((await userModal(page).count()) > 0) {
      await userModalCloseButton(page).click()
    }
    await runTest(page)
  },
})

export { expect }
