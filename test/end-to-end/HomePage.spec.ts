import { test, expect } from '@playwright/test'
import {
  landingShortUrlPrefix,
  rootLocation,
  rotatedLandingLinks,
} from './util/config'
import { emptyStorageState } from './util/auth'
import {
  expectOnLoginPage,
  getStartedLink,
  headerSignInButton,
  homeStatValueByLabel,
  publicOfficerSignInLink,
  rotatingLinksGraphic,
  shortenLinksNowLink,
} from './util/helpers'
import { gotoPage } from './util/navigation'

test.use({ storageState: emptyStorageState })

test.beforeEach(async ({ page }) => {
  await gotoPage(page, rootLocation)
})

test('Landing graphic shows animated rotating example short links', async ({
  page,
}) => {
  await page.waitForResponse(
    (response) =>
      new URL(response.url()).pathname === '/api/links' && response.ok(),
  )

  const graphic = rotatingLinksGraphic(page)
  await expect(graphic).toContainText(landingShortUrlPrefix)

  const rotatedLinkPattern = new RegExp(rotatedLandingLinks.join('|'))
  await expect.poll(async () => graphic.innerText()).toMatch(rotatedLinkPattern)

  const firstText = await graphic.innerText()
  // ReactTyped cycles strings after typing and backDelay (~2.5s).
  await expect
    .poll(async () => graphic.innerText(), { timeout: 15_000 })
    .not.toBe(firstText)
})

test('Home page statistics are loaded and not all zero', async ({ page }) => {
  await page.waitForResponse(
    (response) =>
      new URL(response.url()).pathname === '/api/stats' && response.ok(),
  )

  const statLabels = [
    'PUBLIC OFFICERS ONBOARD',
    'SHORT LINKS CREATED',
    'CLICKS',
  ]

  await Promise.all(
    statLabels.map(async (label) => {
      await expect(homeStatValueByLabel(page, label)).not.toHaveText(/^0$/)
    }),
  )
})

test('Home page login entry points navigate to the login page', async ({
  page,
}) => {
  await headerSignInButton(page).click()
  await expectOnLoginPage(page)

  await gotoPage(page, rootLocation)
  await shortenLinksNowLink(page).click()
  await expectOnLoginPage(page)

  await gotoPage(page, rootLocation)
  await publicOfficerSignInLink(page).click()
  await expectOnLoginPage(page)

  await gotoPage(page, rootLocation)
  await getStartedLink(page).click()
  await expectOnLoginPage(page)
})
