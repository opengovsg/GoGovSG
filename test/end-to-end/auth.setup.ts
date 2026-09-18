import fs from 'fs'
import { type Page, test as setup } from '@playwright/test'
import { rootLocation, testEmail, transferEmail } from './util/config'
import { loginProcedure } from './util/LoginProcedure'
import { gotoPage } from './util/navigation'
import { authDir, testUserAuthFile, transferUserAuthFile } from './util/auth'

/**
 * Runs once per browser project as a `dependencies` setup project, so the two
 * OTP round-trips happen once per shard instead of once per test. This is a
 * setup project rather than `globalSetup` because globalSetup gets no say in
 * which browser it launches -- `FullConfig.projects` is not narrowed by
 * `--project`, so it could only ever hardcode one, and CI shards install only
 * the browser for their own matrix entry.
 */
async function authenticate(
  page: Page,
  email: string,
  authFile: string,
): Promise<void> {
  fs.mkdirSync(authDir, { recursive: true })

  await gotoPage(page, rootLocation)
  await loginProcedure(page, email)
  await page.context().storageState({ path: authFile })
}

setup('authenticate test user', async ({ page, browserName }) => {
  await authenticate(page, testEmail, testUserAuthFile(browserName))
})

setup('authenticate transfer user', async ({ page, browserName }) => {
  await authenticate(page, transferEmail, transferUserAuthFile(browserName))
})
