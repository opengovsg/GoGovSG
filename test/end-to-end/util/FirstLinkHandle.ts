import { createLinkButton } from './helpers'

/**
 * Handles the action of opening creation modal.
 * If there are no links in the account, link button 2 will be present.
 * If there is at least 1 link in the account, link button 1 will be present.
 * If viewing in mobile mode, link button 0 will be present.
 */
const firstLinkHandle = async (t) => {
  if (await createLinkButton.nth(2).exists) {
    await t.click(createLinkButton.nth(2))
  } else if (await createLinkButton.nth(1).exists) {
    await t.click(createLinkButton.nth(1))
  } else {
    await t.click(createLinkButton.nth(0))
  }
}

export default firstLinkHandle
