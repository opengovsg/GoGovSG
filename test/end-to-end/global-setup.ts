import fs from 'fs'
import { chromium, type FullConfig } from '@playwright/test'
import { rootLocation, testEmail, transferEmail } from './util/config'
import { loginProcedure } from './util/LoginProcedure'
import { gotoPage } from './util/navigation'
import {
  authDir,
  testUserAuthFile,
  transferUserAuthFile,
} from './util/auth'

async function saveAuthState(
  email: string,
  path: string,
): Promise<void> {
  const browser = await chromium.launch()
  const context = await browser.newContext({ baseURL: rootLocation })
  const page = await context.newPage()

  await gotoPage(page, rootLocation)
  await loginProcedure(page, email)
  await context.storageState({ path })

  await context.close()
  await browser.close()
}

async function globalSetup(_config: FullConfig): Promise<void> {
  fs.mkdirSync(authDir, { recursive: true })

  await saveAuthState(testEmail, testUserAuthFile)
  await saveAuthState(transferEmail, transferUserAuthFile)
}

export default globalSetup
