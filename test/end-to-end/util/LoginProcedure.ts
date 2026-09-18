import { expect, Page } from '@playwright/test'
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

const hasAnnouncementContent = (announcement: unknown): boolean =>
  typeof announcement === 'object' &&
  announcement !== null &&
  ['message', 'title', 'subtitle', 'url', 'image', 'buttonText'].some(
    (field) =>
      field in announcement && Boolean(Reflect.get(announcement, field)),
  )

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

  const previousAnnouncement = await page.evaluate(() =>
    localStorage.getItem('announcement'),
  )
  const announcementResponse = page.waitForResponse(
    (response) => new URL(response.url()).pathname === '/api/user/announcement',
  )

  await signInButton(page).click()
  await loginSuccessAlert(page).click()

  const announcement = await (await announcementResponse).json()
  const shouldShowAnnouncement =
    previousAnnouncement !== JSON.stringify(announcement) &&
    hasAnnouncementContent(announcement)

  if (shouldShowAnnouncement) {
    await expect(userModal(page)).toBeVisible()
    await userModalCloseButton(page).click()
    await expect(userModal(page)).toBeHidden()
  } else {
    await expect(userModal(page)).toBeHidden()
  }

  await clearMaildevInbox()
}

export default loginProcedure
