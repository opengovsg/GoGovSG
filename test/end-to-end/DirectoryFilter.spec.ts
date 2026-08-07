import { expect } from '@playwright/test'
import { test } from './fixtures'
import { testEmail } from './util/config'
import {
  activeButton,
  activeButtonStyle,
  clickAway,
  copyAlert,
  cssRgbChannels,
  directoryFilterPanel,
  directoryFilterPanelButton,
  directoryPageButton,
  directoryTextFieldEmail,
  directoryTextFieldKeyword,
  directoryUrlTableRowEmail,
  directoryUrlTableRowUrlText,
  emailToggle,
  fileButton,
  fileButtonStyle,
  inactiveButton,
  inactiveButtonStyle,
  linkButton,
  linkButtonStyle,
  mostPopularFilter,
  mostRecentFilter,
  resetButton,
  sortOptionSelected,
  toggle,
  uncheckedButtonBackground,
  userApplyButton,
} from './util/helpers'
import { linkCreationProcedure } from './util/LinkCreationProcedure'

test.describe.serial('Directory Filter', () => {
  let createdLinks: Awaited<ReturnType<typeof linkCreationProcedure>>

  test('Populate with links', async ({ page }) => {
    createdLinks = await linkCreationProcedure(page)
  })

  test('Default settings', async ({ page }) => {
    // Clicking on the directory page button brings user to directory page
    await directoryPageButton(page).click()
    await expect(page).toHaveURL(/directory/)

    // Clicking on the button at the end of the search input should open the sort and filter panel
    await directoryFilterPanelButton(page).click()
    await expect(directoryFilterPanel(page)).toBeVisible()
    // Panel should be closed when clicking outside of it
    await clickAway(page)
    await expect(directoryFilterPanel(page)).not.toBeVisible()

    // Default search results should be by keyword, sort by recency, with all states, both url and file types
    await directoryPageButton(page).click()
    await directoryFilterPanelButton(page).click()
    await expect(directoryTextFieldKeyword(page)).toBeVisible()
    await expect(directoryTextFieldEmail(page)).not.toBeVisible()
    expect(
      cssRgbChannels(
        await linkButtonStyle(page).evaluate(
          (el) => getComputedStyle(el).backgroundColor,
        ),
      ),
    ).toBe(cssRgbChannels(uncheckedButtonBackground))
    expect(
      cssRgbChannels(
        await fileButtonStyle(page).evaluate(
          (el) => getComputedStyle(el).backgroundColor,
        ),
      ),
    ).toBe(cssRgbChannels(uncheckedButtonBackground))
    expect(
      cssRgbChannels(
        await activeButtonStyle(page).evaluate(
          (el) => getComputedStyle(el).backgroundColor,
        ),
      ),
    ).toBe(cssRgbChannels(uncheckedButtonBackground))
    expect(
      cssRgbChannels(
        await inactiveButtonStyle(page).evaluate(
          (el) => getComputedStyle(el).backgroundColor,
        ),
      ),
    ).toBe(cssRgbChannels(uncheckedButtonBackground))
    await expect(sortOptionSelected(mostPopularFilter(page))).toHaveCount(0)
    await expect(sortOptionSelected(mostRecentFilter(page))).toBeVisible()
  })

  test('Directory Page test search by keyword and email', async ({ page }) => {
    const { generatedUrlFile } = createdLinks

    // Clicking on the directory page button brings user to directory page
    await directoryPageButton(page).click()

    // search by keyword
    await directoryTextFieldKeyword(page).fill(`${generatedUrlFile}`)
    expect(await directoryUrlTableRowUrlText(page, 0)).toBe(
      `/${generatedUrlFile}`,
    )
    // change in url
    await expect(page).toHaveURL(new RegExp(`query=${generatedUrlFile}`))

    // search by email
    await toggle(page).click()
    await emailToggle(page).click()
    // reset search result
    expect(await directoryTextFieldEmail(page).inputValue()).toBe('')
    // find email results
    await directoryTextFieldEmail(page).fill(testEmail)
    expect(await directoryUrlTableRowEmail(page, 0).innerText()).toBe(testEmail)
    // change in url (email in url)
    await expect(page).toHaveURL(
      new RegExp(`query=${testEmail}`.replace('@', '%40')),
    )
    // change in url (isEmail in url)
    await expect(page).toHaveURL(/isEmail=true/)
  })

  test('Directory Page test recency sort order', async ({ page }) => {
    const {
      generatedUrlFile,
      generatedUrlInactive,
      generatedUrlActive,
      searchKey,
    } = createdLinks

    /*

    Based on LinkCreationProcedure recency sort order (most recent on top):
    1. generatedUrlFile,
    2. generatedUrlInactive,
    3. generatedUrlActive

    */

    await directoryPageButton(page).click()
    // search by search key
    await directoryTextFieldKeyword(page).fill(searchKey)
    // first row
    expect(await directoryUrlTableRowUrlText(page, 0)).toBe(
      `/${generatedUrlFile}`,
    )
    // second row
    expect(await directoryUrlTableRowUrlText(page, 1)).toBe(
      `/${generatedUrlInactive}`,
    )
    // third row
    expect(await directoryUrlTableRowUrlText(page, 2)).toBe(
      `/${generatedUrlActive}`,
    )
  })

  test('Directory Page test popularity sort order', async ({ page }) => {
    const {
      generatedUrlMostPopular,
      generatedUrlSecondMostPopular,
      searchKey,
    } = createdLinks

    /*

    Based on LinkCreationProcedure popularity sort order (most popular on top):
    1. generatedUrlMostPopular
    2. generatedUrlSecondMostPopular

    */

    await directoryPageButton(page).click()
    // change filter to 'most popularity'
    await directoryFilterPanelButton(page).click()
    await mostPopularFilter(page).click()
    await userApplyButton(page).click()
    // search by search key
    await directoryTextFieldKeyword(page).fill(searchKey)
    // first row
    expect(await directoryUrlTableRowUrlText(page, 0)).toBe(
      `/${generatedUrlMostPopular}`,
    )
    // second row
    expect(await directoryUrlTableRowUrlText(page, 1)).toBe(
      `/${generatedUrlSecondMostPopular}`,
    )
  })

  test('Directory Page filter by active', async ({ page }) => {
    const { generatedUrlFile, generatedUrlActive, searchKey } = createdLinks

    /*

    Based on LinkCreationProcedure with sorting by recency and active:
    1. generatedUrlFile,
    2. generatedUrlActive

    */

    await directoryPageButton(page).click()
    // change filter to active
    await directoryFilterPanelButton(page).click()
    await activeButton(page).click()
    await userApplyButton(page).click()
    // search by search key
    await directoryTextFieldKeyword(page).fill(searchKey)
    // first row
    expect(await directoryUrlTableRowUrlText(page, 0)).toBe(
      `/${generatedUrlFile}`,
    )
    // second row
    expect(await directoryUrlTableRowUrlText(page, 1)).toBe(
      `/${generatedUrlActive}`,
    )
  })

  test('Directory Page filter by inactive', async ({ page }) => {
    const { generatedUrlInactive, searchKey } = createdLinks

    /*

    Based on LinkCreationProcedure with sorting by recency and inactive:
    1. generatedUrlInactive
    */

    await directoryPageButton(page).click()
    // change filter to inactive
    await directoryFilterPanelButton(page).click()
    await inactiveButton(page).click()
    await userApplyButton(page).click()
    // search by search key
    await directoryTextFieldKeyword(page).fill(searchKey)
    // first row
    expect(await directoryUrlTableRowUrlText(page, 0)).toBe(
      `/${generatedUrlInactive}`,
    )
  })

  test('Directory Page filter by file', async ({ page }) => {
    const { generatedUrlFile, searchKey } = createdLinks

    /*

    Based on LinkCreationProcedure with sorting by recency and file:
    1. generatedUrlFile,

    */

    await directoryPageButton(page).click()
    // change filter to file
    await directoryFilterPanelButton(page).click()
    await fileButton(page).click()
    await userApplyButton(page).click()
    // search by search key
    await directoryTextFieldKeyword(page).fill(searchKey)
    // first row
    expect(await directoryUrlTableRowUrlText(page, 0)).toBe(
      `/${generatedUrlFile}`,
    )
  })

  test('Directory Page filter by url', async ({ page }) => {
    const { generatedUrlInactive, generatedUrlActive, searchKey } = createdLinks

    /*

    Based on LinkCreationProcedure with sorting by recency and url:
    1. generatedUrlInactive
    2. generatedUrlFile,

    */

    await directoryPageButton(page).click()
    // change filter to file
    await directoryFilterPanelButton(page).click()
    await linkButton(page).click()
    await userApplyButton(page).click()
    // search by search key
    await directoryTextFieldKeyword(page).fill(searchKey)
    // first row
    expect(await directoryUrlTableRowUrlText(page, 0)).toBe(
      `/${generatedUrlInactive}`,
    )
    // second row
    expect(await directoryUrlTableRowUrlText(page, 1)).toBe(
      `/${generatedUrlActive}`,
    )
  })

  test('Directory Page test reset filter', async ({ page }) => {
    await directoryPageButton(page).click()
    // change filter to file
    await directoryFilterPanelButton(page).click()
    await mostPopularFilter(page).click()
    await activeButton(page).click()
    await inactiveButton(page).click()
    await linkButton(page).click()
    await fileButton(page).click()
    await userApplyButton(page).click()
    // check all styles of selected values
    expect(
      cssRgbChannels(
        await linkButtonStyle(page).evaluate(
          (el) => getComputedStyle(el).backgroundColor,
        ),
      ),
    ).not.toBe(cssRgbChannels(uncheckedButtonBackground))
    expect(
      cssRgbChannels(
        await fileButtonStyle(page).evaluate(
          (el) => getComputedStyle(el).backgroundColor,
        ),
      ),
    ).not.toBe(cssRgbChannels(uncheckedButtonBackground))
    expect(
      cssRgbChannels(
        await activeButtonStyle(page).evaluate(
          (el) => getComputedStyle(el).backgroundColor,
        ),
      ),
    ).not.toBe(cssRgbChannels(uncheckedButtonBackground))
    expect(
      cssRgbChannels(
        await inactiveButtonStyle(page).evaluate(
          (el) => getComputedStyle(el).backgroundColor,
        ),
      ),
    ).not.toBe(cssRgbChannels(uncheckedButtonBackground))
    await expect(sortOptionSelected(mostPopularFilter(page))).toBeVisible()
    await expect(sortOptionSelected(mostRecentFilter(page))).toHaveCount(0)

    // reset
    await directoryFilterPanelButton(page).click()
    await resetButton(page).click()
    expect(
      cssRgbChannels(
        await linkButtonStyle(page).evaluate(
          (el) => getComputedStyle(el).backgroundColor,
        ),
      ),
    ).toBe(cssRgbChannels(uncheckedButtonBackground))
    expect(
      cssRgbChannels(
        await fileButtonStyle(page).evaluate(
          (el) => getComputedStyle(el).backgroundColor,
        ),
      ),
    ).toBe(cssRgbChannels(uncheckedButtonBackground))
    expect(
      cssRgbChannels(
        await activeButtonStyle(page).evaluate(
          (el) => getComputedStyle(el).backgroundColor,
        ),
      ),
    ).toBe(cssRgbChannels(uncheckedButtonBackground))
    expect(
      cssRgbChannels(
        await inactiveButtonStyle(page).evaluate(
          (el) => getComputedStyle(el).backgroundColor,
        ),
      ),
    ).toBe(cssRgbChannels(uncheckedButtonBackground))
    await expect(sortOptionSelected(mostPopularFilter(page))).toHaveCount(0)
    await expect(sortOptionSelected(mostRecentFilter(page))).toBeVisible()
  })

  test('Directory Page test url row interactions', async ({ page }) => {
    const { generatedUrlActive } = createdLinks

    const emailField = directoryUrlTableRowEmail(page, 0)
    await directoryPageButton(page).click()
    // search by url
    await directoryTextFieldKeyword(page).fill(generatedUrlActive)
    // first row
    expect(await directoryUrlTableRowUrlText(page, 0)).toBe(
      `/${generatedUrlActive}`,
    )
    // test hover over email
    expect(
      await emailField.evaluate((el) => getComputedStyle(el).textDecoration),
    ).not.toContain('underline')
    await emailField.hover()
    expect(
      await emailField.evaluate((el) => getComputedStyle(el).textDecoration),
    ).toContain('underline')
    // copy email
    page.on('dialog', (dialog) => dialog.accept())
    await emailField.locator('xpath=./*').first().click()
    // Testcafe does not have any inbuilt clipboard
    await expect(copyAlert(page)).toBeVisible()
  })
})
