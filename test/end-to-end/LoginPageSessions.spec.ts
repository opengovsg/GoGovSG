import { test, expect } from '@playwright/test'
import {
  incorrectEmail,
  incorrectOtp,
  rootLocation,
  testEmail,
} from './util/config'
import {
  emailHelperText,
  getLocation,
  loginButton,
  signInButton,
} from './util/helpers'
import { loginProcedure } from './util/LoginProcedure'

test('Invalid Email that does not end with .gov.sg and should not allow submission', async ({
  page,
}) => {
  await page.goto(rootLocation)
  await loginButton(page).click()
  await page.locator('#email').fill(`${incorrectEmail}`)
  // It should respond with invalid email when email does not end with .gov.sg
  await expect(emailHelperText(page)).toHaveText(
    "This doesn't look like a valid gov.sg email.",
  )
  // It should not allow submission when email is invalid
  await expect(signInButton(page)).toBeDisabled()
})

test('Invalid OTP should not log the user in', async ({ page }) => {
  await page.goto(rootLocation)
  await loginButton(page).click()
  await page.locator('#email').fill(`${testEmail}`)
  await signInButton(page).click()
  await page.locator('#otp').fill(`${incorrectOtp}`)
  await signInButton(page).click()
  // Invalid OTP should not log the user in
  await expect(page.locator('div[role="alert"]')).toBeVisible()
})

test('After trying to enter wrong OTP 3 times, it should respond with OTP not found/expired (a new OTP must be requested)', async ({
  page,
}) => {
  await page.goto(rootLocation)
  await loginButton(page).click()
  await page.locator('#email').fill(`${testEmail}`)
  await signInButton(page).click()
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
  await page.goto(`${rootLocation}/#/user`)
  // Visiting /user should redirect to login page when not logged in
  expect(getLocation(page)).toMatch(/login/)
})

test('Valid OTP should log the user in', async ({ page }) => {
  await page.goto(rootLocation)
  // Shows the homepage if user does not have an existing session
  await loginProcedure(page)

  // Redirects to /user if user has an existing session (ie logged in previously on the same browser)
  await page.goto(rootLocation)
  expect(getLocation(page)).toMatch(/user/)
})
