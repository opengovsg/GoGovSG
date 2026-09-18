import { expect, Page } from '@playwright/test'
import { signOutButton } from './helpers'

export async function logoutProcedure(page: Page): Promise<void> {
  const logoutResponse = page.waitForResponse(
    (response) => new URL(response.url()).pathname === '/api/logout',
  )

  await signOutButton(page).click()
  expect((await logoutResponse).ok()).toBeTruthy()
  // Signing out redirects to the standalone /login page, which has no
  // `banner` landmark, so `loginButton` (scoped to the home page's header)
  // cannot be reused here.
  await expect(page).toHaveURL(/login/)
}

export default logoutProcedure
