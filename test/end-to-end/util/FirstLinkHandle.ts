import { Page } from '@playwright/test'
import { createLinkButton } from './helpers'

/**
 * Handles the action of opening creation modal.
 * If there are no links in the account, link button 2 will be present.
 * If there is at least 1 link in the account, link button 1 will be present.
 * If viewing in mobile mode, link button 0 will be present.
 */
export async function firstLinkHandle(page: Page): Promise<void> {
  if ((await createLinkButton(page).nth(2).count()) > 0) {
    await createLinkButton(page).nth(2).click()
  } else if ((await createLinkButton(page).nth(1).count()) > 0) {
    await createLinkButton(page).nth(1).click()
  } else {
    await createLinkButton(page).nth(0).click()
  }
}

export default firstLinkHandle
