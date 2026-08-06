import { expect } from '@playwright/test'
import { test } from './fixtures'
import {
  bottomMobilePanel,
  copyAlert,
  directoryTextFieldKeyword,
  directoryUrlTableRowUrl,
  directoryUrlTableRowUrlText,
  mobileCopyEmailIcon,
  mobileDirectoryPageButton,
} from './util/helpers'
import { singleLinkCreationProcedure } from './util/LinkCreationProcedure'

test.describe.serial('Directory Filter Mobile view', () => {
  test.beforeEach(async ({ page }) => {
    await page.setViewportSize({ width: 400, height: 600 })
  })

  let createdLinks: Awaited<ReturnType<typeof singleLinkCreationProcedure>>

  test('Populate with links', async ({ page }) => {
    createdLinks = await singleLinkCreationProcedure(page)
  })

  test('Directory Page test url row interactions', async ({ page }) => {
    const { generatedUrlActive } = createdLinks

    await mobileDirectoryPageButton(page).click()
    // search by url
    await directoryTextFieldKeyword(page).fill(generatedUrlActive)
    // first row
    expect(await directoryUrlTableRowUrlText(page, 0)).toBe(
      `/${generatedUrlActive}`,
    )
    // test bottom panel appears
    await expect(bottomMobilePanel(page)).not.toBeVisible()
    await directoryUrlTableRowUrl(page, 0).click()
    await expect(bottomMobilePanel(page)).toBeVisible()
    // copy email
    page.on('dialog', (dialog) => dialog.accept())
    await mobileCopyEmailIcon(page).click()
    // Testcafe does not have any inbuilt clipboard
    await expect(copyAlert(page)).toBeVisible()
  })
})
