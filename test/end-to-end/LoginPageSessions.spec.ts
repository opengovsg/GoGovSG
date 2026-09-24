import { test, expect, Page } from '@playwright/test'
import { OTP_FORMAT_ERROR_MESSAGE } from '../../src/shared/util/validation'
import {
  incorrectEmail,
  incorrectOtp,
  invalidFormatOtp,
  rootLocation,
  testEmail,
} from './util/config'
import { emptyStorageState } from './util/auth'
import {
  emailHelperText,
  loginButton,
  loginProgressBar,
  otpHelperText,
  signInButton,
} from './util/helpers'
import { loginProcedure } from './util/LoginProcedure'
import { logoutProcedure } from './util/LogoutProcedure'
import { gotoPage } from './util/navigation'

test.use({ storageState: emptyStorageState })

async function openOtpEntry(page: Page) {
  await gotoPage(page, rootLocation)
  await loginButton(page).click()
  await page.locator('#email').fill(testEmail)
  await signInButton(page).click()
  await expect(page.locator('#otp')).toBeVisible()
}

test('Invalid Email that does not end with .gov.sg and should not allow submission', async ({
  page,
}) => {
  await gotoPage(page, rootLocation)
  await loginButton(page).click()
  await page.locator('#email').fill(`${incorrectEmail}`)
  // It should respond with invalid email when email does not end with .gov.sg
  await expect(emailHelperText(page)).toHaveText(
    "This doesn't look like a valid gov.sg email.",
  )
  // It should not allow submission when email is invalid
  await expect(signInButton(page)).toBeDisabled()
})

test('Invalid OTP format shows client validation for special characters', async ({
  page,
}) => {
  await openOtpEntry(page)
  await page.locator('#otp').fill(invalidFormatOtp)
  await expect(otpHelperText(page)).toHaveText(OTP_FORMAT_ERROR_MESSAGE)
  await expect(signInButton(page)).toBeDisabled()
})

test('Invalid OTP format from server clears loading and shows error', async ({
  page,
}) => {
  await openOtpEntry(page)
  await page.locator('#otp').fill(invalidFormatOtp)
  // Submit via the form so we hit the API even when the submit button stays disabled.
  const verifyResponse = page.waitForResponse(
    (response) =>
      response.url().includes('/api/login/verify') &&
      response.request().method() === 'POST',
  )
  await page.locator('form').evaluate((form: HTMLFormElement) => {
    form.requestSubmit()
  })
  await verifyResponse
  await expect(page.locator('div[role="alert"]')).toContainText(
    OTP_FORMAT_ERROR_MESSAGE,
  )
  await expect(loginProgressBar(page)).toHaveCount(0)
  await expect(page.locator('#otp')).toBeEnabled()
})

test('Network failure during OTP verify clears loading and shows error', async ({
  page,
}) => {
  await openOtpEntry(page)
  await page.locator('#otp').fill(incorrectOtp)
  await page.route('**/api/login/verify', (route) => route.abort('failed'))
  await signInButton(page).click()
  await expect(page.locator('div[role="alert"]')).toContainText(
    'Network connectivity failed.',
  )
  await expect(loginProgressBar(page)).toHaveCount(0)
  await expect(page.locator('#otp')).toBeEnabled()
})

test('Invalid OTP should not log the user in', async ({ page }) => {
  await openOtpEntry(page)
  await page.locator('#otp').fill(`${incorrectOtp}`)
  await signInButton(page).click()
  // Invalid OTP should not log the user in
  await expect(page.locator('div[role="alert"]')).toBeVisible()
})

test('After trying to enter wrong OTP 3 times, it should respond with OTP not found/expired (a new OTP must be requested)', async ({
  page,
}) => {
  await openOtpEntry(page)
  await page.locator('#otp').fill(`${incorrectOtp}`)
  await signInButton(page).click()
  await signInButton(page).click()
  await signInButton(page).click()
  await signInButton(page).click()
  // After trying to enter wrong OTP 3 times, it should respond with OTP not found/expired (a new OTP must be requested)
  await expect(
    page.locator('div[role="alert"]').locator('xpath=./*').nth(0),
  ).toHaveText('OTP expired/not found.')
})

test('Visiting/user should redirect to login page when not logged in', async ({
  page,
}) => {
  await gotoPage(page, `${rootLocation}/#/user`)
  // Visiting /user should redirect to login page when not logged in
  await expect(page).toHaveURL(/login/)
})

test('Valid OTP should log the user in', async ({ page }) => {
  await gotoPage(page, rootLocation)
  // Shows the homepage if user does not have an existing session
  await loginProcedure(page)

  // Redirects to /user if user has an existing session (ie logged in previously on the same browser)
  await gotoPage(page, rootLocation)
  await expect(page).toHaveURL(/user/)
})

// Sign-out lives here, not in the link-transfer specs: this spec owns its
// session (`emptyStorageState` above), so destroying it server-side cannot
// invalidate the storage state the rest of the suite shares.
test('Signing out ends the session', async ({ page }) => {
  await gotoPage(page, rootLocation)
  await loginProcedure(page)

  await logoutProcedure(page)

  // The session is gone server-side, not just cleared in the browser.
  await gotoPage(page, `${rootLocation}/#/user`)
  await expect(page).toHaveURL(/login/)
})
