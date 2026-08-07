import { test as setup } from '@playwright/test'
import fs from 'fs'
import path from 'path'
import {
  rootLocation,
  testEmail,
  transferEmail,
  userAuthFile,
} from './util/config'
import { loginProcedure } from './util/LoginProcedure'
import { signOutButton } from './util/helpers'

setup('authenticate', async ({ page, browserName }) => {
  const authFile = userAuthFile(browserName)
  fs.mkdirSync(path.dirname(authFile), { recursive: true })

  // Create the transfer recipient account so transfer tests can skip priming.
  await page.goto(rootLocation)
  await loginProcedure(page, transferEmail)
  await signOutButton(page).click()
  await page.goto(rootLocation)

  await loginProcedure(page, testEmail)
  await page.context().storageState({ path: authFile })
})
