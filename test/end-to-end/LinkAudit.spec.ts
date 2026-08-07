import { test, expect } from './fixtures'
import {
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
  successSnackBar,
  tagCloseButton1,
  tagsAutocompleteInput,
  tagsSaveButton,
  tagsUpdatedSnackbar,
  transferButton,
  urlSaveButton,
  urlUpdatedSnackbar,
} from './util/helpers'
import { restoreAuthState, transferUserAuthFile } from './util/auth'
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
  // Disable the link. toggleUrlState only updates the store once the PATCH
  // comes back ok, so the switch flipping is proof the change was persisted --
  // without this the link history can be fetched before the server has it.
  await activeSwitch(page).click()
  await expect(activeSwitch(page)).not.toBeChecked()
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
  await expect(urlUpdatedSnackbar(page)).toBeVisible()
  // Go to link history
  await linkHistoryViewButton(page).click()
  // Check if the link history span is created
  await expect(linkHistoryOriginalLinkH6(page)).toBeVisible()
})

test('Changing the link owner should update the link history with Link Owner update change set', async ({
  page,
  browserName,
}) => {
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
  // Switch to the new owner by restoring their cookies rather than signing
  // out: /api/logout destroys the session server-side, which would invalidate
  // the shared storage state for every test that runs after this one.
  await restoreAuthState(page, transferUserAuthFile(browserName))
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
  await expect(tagsUpdatedSnackbar(page)).toBeVisible()
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
