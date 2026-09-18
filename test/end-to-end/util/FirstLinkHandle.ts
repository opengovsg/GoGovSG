import { Page } from '@playwright/test'
import { submitCreateLinkModal } from './helpers'

/**
 * Submits the create-link form and waits for its modal to close.
 */
export async function firstLinkHandle(page: Page): Promise<void> {
  await submitCreateLinkModal(page)
}

export default firstLinkHandle
