import { test, expect } from './fixtures'
import {
  rootLocation,
  subUrl,
  tagText1,
  tagText2,
  tagText3,
  testEmail,
  transferEmail,
} from './util/config'
import {
  activeSwitch,
  closeButtonSnackBar,
  exactText,
  linkHistoryCreateSpan,
  linkHistoryLinkOwnerH6,
  linkHistoryLinkStatusH6,
  linkHistoryOriginalLinkH6,
  linkHistoryTagsH6,
  linkHistoryViewButton,
  linkRowByShortUrl,
  linkTransferField,
  longUrl,
  signOutButton,
  successSnackBar,
  tagCloseButton1,
  tagsAutocompleteInput,
  tagsSaveButton,
  transferButton,
  urlSaveButton,
} from './util/helpers'
import { loginProcedure } from './util/LoginProcedure'
import { createNewLink } from './util/CreateNewLink'

test('Creating a new url updates the link history with create change set', async ({
  page,
}) => {
  // Create new link
  const generatedShortLink = await createNewLink(page)
  const linkRow = linkRowByShortUrl(page, generatedShortLink)
  // Click the url in the table to open the drawer
  await linkRow.click()
  // Go to link history
  await linkHistoryViewButton(page).click()
  // Check if the link history span is created
  await expect(linkHistoryCreateSpan(page)).toBeVisible()
})

test('Disabling the link should update the link history with Link Status update change set', async ({
  page,
}) => {
  // Create new link
  const generatedShortLink = await createNewLink(page)
  const linkRow = linkRowByShortUrl(page, generatedShortLink)
  // Click the url in the table to open the drawer
  await linkRow.click()
  // Disable the link
  await activeSwitch(page).click()
  // Go to link history
  await linkHistoryViewButton(page).click()
  // Check if the link history span is created
  await expect(linkHistoryLinkStatusH6(page)).toBeVisible()
})

test('Changing the original link should update the link history with Original Link update change set', async ({
  page,
}) => {
  // Create new link
  const generatedShortLink = await createNewLink(page)
  const linkRow = linkRowByShortUrl(page, generatedShortLink)
  // Click the url in the table to open the drawer
  await linkRow.click()

  // Update the original link
  await longUrl(page).fill(`${subUrl}`)
  await urlSaveButton(page).click()
  // Go to link history
  await linkHistoryViewButton(page).click()
  // Check if the link history span is created
  await expect(linkHistoryOriginalLinkH6(page)).toBeVisible()
})

test('Changing the link owner should update the link history with Link Owner update change set', async ({
  page,
}) => {
  // Prime transferEmail (fixture already logged in as testEmail).
  await signOutButton(page).click()
  await page.goto(rootLocation)
  await loginProcedure(page, transferEmail)
  await signOutButton(page).click()
  await page.goto(rootLocation)
  await loginProcedure(page, testEmail)

  // Create new link
  const generatedShortLink = await createNewLink(page)
  const linkRow = linkRowByShortUrl(page, generatedShortLink)
  // Click the url in the table to open the drawer
  await linkRow.click()
  // Transfer ownership of the link
  await linkTransferField(page).fill(`${transferEmail}`)
  await transferButton(page).click()
  await expect(successSnackBar(page)).toBeVisible()
  // Dismiss the transfer toast so it doesn't intercept the Sign out click.
  if ((await successSnackBar(page).count()) > 0) {
    await closeButtonSnackBar(page).click()
  }
  // Sign out
  await signOutButton(page).click()
  await page.goto(rootLocation)
  // Login using the new link owner
  await loginProcedure(page, transferEmail)
  // Open Drawer
  await linkRow.click()
  // Go to link history
  await linkHistoryViewButton(page).click()
  // Check if the link history span is created
  await expect(linkHistoryLinkOwnerH6(page)).toBeVisible()
})

test('Changing the tags should update the link history with Tags update change set', async ({
  page,
}) => {
  // Create new link
  const generatedShortLink = await createNewLink(page)
  const linkRow = linkRowByShortUrl(page, generatedShortLink)
  // Click the url in the table to open the drawer
  await linkRow.click()
  // Remove one existing tag and add two new tags
  await tagCloseButton1(page).click()
  await tagsAutocompleteInput(page).fill(tagText2)
  await tagsAutocompleteInput(page).press('Enter')
  await tagsAutocompleteInput(page).fill(tagText3)
  await tagsAutocompleteInput(page).press('Enter')
  await tagsSaveButton(page).click()
  // Go to link history
  await linkHistoryViewButton(page).click()
  // Check if the link history span is created
  await expect(linkHistoryTagsH6(page)).toBeVisible()
  await expect(
    page.locator('.MuiChip-label', { hasText: exactText(tagText1) }),
  ).toBeVisible()
  await expect(
    page.locator('.MuiChip-label', { hasText: exactText(tagText2) }),
  ).toBeVisible()
  await expect(
    page.locator('.MuiChip-label', { hasText: exactText(tagText3) }),
  ).toBeVisible()
})
