import { expect, Page } from '@playwright/test'
import { loginButton, signOutButton } from './helpers'

export async function logoutProcedure(page: Page): Promise<void> {
  const logoutResponse = page.waitForResponse(
    (response) => new URL(response.url()).pathname === '/api/logout',
  )

  await signOutButton(page).click()
  expect((await logoutResponse).ok()).toBeTruthy()
  await expect(loginButton(page)).toBeVisible()
}

export default logoutProcedure
