import { expect } from '@playwright/test'
import { anonymousTest as test } from './fixtures'
import { loginProcedure } from './util/LoginProcedure'
import { gotoPage } from './util/navigation'
import { rootLocation } from './util/config'
import {
  apiIntegrationPageButton,
  copyButton,
  generateApiKeyButton,
  iHaveCopiedButton,
  regenerateApiKeyButton,
} from './util/helpers'

test.beforeEach(async ({ page }) => {
  const email = `${Date.now().toString()}@open.gov.sg`
  await gotoPage(page, rootLocation)
  await loginProcedure(page, email)
})

test('No API Key view', async ({ page }) => {
  await apiIntegrationPageButton(page).click()
  await expect(page).toHaveURL(/apiintegration/)

  await expect(generateApiKeyButton(page)).toBeVisible()
  await expect(regenerateApiKeyButton(page)).not.toBeVisible()
})

test('API Key view', async ({ page }) => {
  await apiIntegrationPageButton(page).click()
  await generateApiKeyButton(page).click()
  await expect(regenerateApiKeyButton(page)).toBeVisible()
})

test('Save API Key modal after clicking generate API button', async ({
  page,
}) => {
  await apiIntegrationPageButton(page).click()
  await generateApiKeyButton(page).click()
  await expect(iHaveCopiedButton(page)).toBeVisible()
  await expect(copyButton(page)).toBeVisible()
  await iHaveCopiedButton(page).click()
  await expect(iHaveCopiedButton(page)).not.toBeVisible()
  await expect(copyButton(page)).not.toBeVisible()
})

test('Save API Key modal after clicking Regenerate API button', async ({
  page,
}) => {
  await apiIntegrationPageButton(page).click()
  await generateApiKeyButton(page).click()
  await iHaveCopiedButton(page).click()
  await regenerateApiKeyButton(page).click()
  await expect(iHaveCopiedButton(page)).toBeVisible()
  await expect(copyButton(page)).toBeVisible()
  await iHaveCopiedButton(page).click()
  await expect(iHaveCopiedButton(page)).not.toBeVisible()
  await expect(copyButton(page)).not.toBeVisible()
})
