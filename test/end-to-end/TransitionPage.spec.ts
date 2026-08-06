import { expect } from '@playwright/test'
import { test } from './fixtures'
import { rootLocation, shortUrl } from './util/config'
import {
  createLinkButton,
  generateUrlImage,
  longUrlTextField,
  shortUrlTextField,
  skipButton,
  getLocation,
} from './util/helpers'
import { firstLinkHandle } from './util/FirstLinkHandle'

test('Transition Page test.', async ({ page }) => {
  await createLinkButton(page).nth(0).click()
  await generateUrlImage(page).click()

  const generatedUrlActive = await shortUrlTextField(page).inputValue()

  await shortUrlTextField(page).fill(`${generatedUrlActive}-redirect`)
  await longUrlTextField(page).fill(`${shortUrl}`)

  await firstLinkHandle(page)

  await page.waitForTimeout(3000)

  // Accessing a short link with a trailing slash should not result in a broken transition page.
  await page.goto(`${rootLocation}/${generatedUrlActive}-redirect/`)

  // Accessing a short link for the first time shows the transition page.
  expect(getLocation(page)).toContain(`${generatedUrlActive}-redirect`)

  // skip button is shown.
  const skipButtonOpacity = await skipButton(page).evaluate(
    (el) => getComputedStyle(el).opacity,
  )
  expect(skipButtonOpacity).toBe('1')

  // After 6 seconds, user is redirected from the transition page to the correct destination long url.
  await page.waitForTimeout(6000)
  expect(getLocation(page)).toContain(`${shortUrl}`)

  // Visiting the same short link again does not show the transition page.
  await page.goto(`${rootLocation}/${generatedUrlActive}-redirect/`)
  expect(getLocation(page)).toContain(`${shortUrl}`)
})
