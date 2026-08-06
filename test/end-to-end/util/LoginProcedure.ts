import { Page } from '@playwright/test'
import { testEmail } from './config'
import {
  clearMaildevInbox,
  getMaildevMessageIds,
  waitForOtpFromMaildev,
} from '../../shared/maildev'
import {
  loginButton,
  loginSuccessAlert,
  signInButton,
  userModal,
  userModalCloseButton,
} from './helpers'

export async function loginProcedure(
  page: Page,
  loginEmail: string = testEmail,
): Promise<void> {
  await loginButton(page).click()
  await page.locator('#email').fill(loginEmail)

  const afterMessageIds = await getMaildevMessageIds()
  await signInButton(page).click()

  const mailOTP = await waitForOtpFromMaildev({
    to: loginEmail,
    afterMessageIds,
  })
  await page.locator('#otp').fill(mailOTP)

  await signInButton(page).click()
  await loginSuccessAlert(page).click()

  await clearMaildevInbox()

  if ((await userModal(page).count()) > 0) {
    await userModalCloseButton(page).click()
  }
}

export default loginProcedure
