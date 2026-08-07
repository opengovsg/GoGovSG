import { expect } from '@playwright/test'
import { test } from './fixtures'
import { rootLocation, shortUrl } from './util/config'
import {
  generateUrlImage,
  linkRowByShortUrl,
  longUrlTextField,
  openCreateLinkModal,
  shortUrlTextField,
  skipButton,
} from './util/helpers'
import { firstLinkHandle } from './util/FirstLinkHandle'
import { gotoPage } from './util/navigation'

test('Transition Page test.', async ({ page }) => {
  await openCreateLinkModal(page)
  await generateUrlImage(page).click()

  const generatedUrlActive = await shortUrlTextField(page).inputValue()

  await shortUrlTextField(page).fill(`${generatedUrlActive}-redirect`)
  await longUrlTextField(page).fill(`${shortUrl}`)

  await firstLinkHandle(page)

  // The row appearing means the server has the link, so the navigation below
  // cannot race creation. Do not probe the redirect endpoint over HTTP instead:
  // page.request shares the cookie jar, and a first hit there sets the cookie
  // that suppresses the transition page this test asserts on.
  await expect(
    linkRowByShortUrl(page, `${generatedUrlActive}-redirect`),
  ).toBeVisible()

  // Accessing a short link with a trailing slash should not result in a broken transition page.
  await gotoPage(page, `${rootLocation}/${generatedUrlActive}-redirect/`)

  // Accessing a short link for the first time shows the transition page.
  await expect(page).toHaveURL((url) =>
    url.href.includes(`${generatedUrlActive}-redirect`),
  )

  // skip button is shown.
  const skipButtonOpacity = await skipButton(page).evaluate(
    (el) => getComputedStyle(el).opacity,
  )
  expect(skipButtonOpacity).toBe('1')

  // After 6 seconds, user is redirected from the transition page to the correct destination long url.
  // Poll instead of a blind wait; 8s gives headroom past the known ~6s timer.
  await expect(page).toHaveURL((url) => url.href.includes(shortUrl), {
    timeout: 8000,
  })

  // Visiting the same short link again does not show the transition page.
  await gotoPage(page, `${rootLocation}/${generatedUrlActive}-redirect/`)
  await expect(page).toHaveURL((url) => url.href.includes(shortUrl))
})
