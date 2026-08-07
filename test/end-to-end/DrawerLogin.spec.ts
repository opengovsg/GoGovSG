import { test, expect } from './fixtures'
import {
  apiLocation,
  dummyFilePath,
  largeFileSize,
  rootLocation,
  shortUrl,
  smallFileSize,
  subUrl,
  tagText1,
  tagText2,
  tagText3,
  testEmail,
  transferEmail,
} from './util/config'
import {
  activeSwitch,
  clickAway,
  closeButtonSnackBar,
  closeDrawerButton,
  createLinkButton,
  drawer,
  exactText,
  fileTab,
  generateUrlImage,
  helperText,
  inactiveWord,
  largeFileError,
  linkErrorSnackBar,
  linkRowByShortUrl,
  linkTransferField,
  longUrl,
  longUrlTextField,
  shortUrlTextField,
  signOutButton,
  successSnackBar,
  tag1,
  tag2,
  tag3,
  tagCloseButton1,
  tagsAutocompleteInput,
  tagsAutocompleteTags,
  tagsSaveButton,
  tagsUpdatedSnackbar,
  transferButton,
  uploadFile,
  urlSaveButton,
  urlUpdatedSnackbar,
} from './util/helpers'
import { loginProcedure } from './util/LoginProcedure'
import { firstLinkHandle } from './util/FirstLinkHandle'
import { createEmptyFileOfSize, deleteFile } from './util/fileHandle'

test('Drawer functionality test for url.', async ({ page }) => {
  await createLinkButton(page).nth(0).click()
  await generateUrlImage(page).click()

  const generatedUrl = await shortUrlTextField(page).inputValue()
  const linkRow = linkRowByShortUrl(page, generatedUrl)
  const linkTableRow = linkRow.locator('xpath=ancestor::tr')

  await tagsAutocompleteInput(page).fill(tagText1)
  await tagsAutocompleteInput(page).press('Enter')

  await longUrlTextField(page).fill(`${shortUrl}`)

  await firstLinkHandle(page)

  await linkRow.click()
  // Drawer should open with the correct long url and tags when a short url row is clicked
  await expect(drawer(page)).toBeVisible()
  await expect(longUrl(page)).toHaveValue(`${shortUrl}`)
  await expect(tag1(page)).toBeVisible()

  await closeDrawerButton(page).click()
  // Drawer can be closed on clickaway or when the close button is clicked.
  await expect(drawer(page)).not.toBeVisible()

  await linkRow.click()
  await activeSwitch(page).nth(0).click()
  // It should set short url active or inactive immediately when the toggle is switched (any caching for that short url is cleared)
  await expect(inactiveWord(page)).toBeVisible()

  await longUrl(page).fill(`${subUrl}`)
  await tagCloseButton1(page).click()
  await closeDrawerButton(page).click()
  await linkRow.click()
  // Url and tags revert to original when user enters a new url, then re-opens the drawer without clicking "save"
  await expect(longUrl(page)).toHaveValue('google.com')

  await longUrl(page).fill(`${subUrl}`)
  await urlSaveButton(page).click()
  // It should show a success snackbar when long url is changed, and the drawer should remain open
  await expect(urlUpdatedSnackbar(page)).toBeVisible()
  await expect(drawer(page)).toBeVisible()

  await tagCloseButton1(page).click()
  await tagsAutocompleteInput(page).click()
  await tagsAutocompleteInput(page).fill(tagText2)
  await tagsAutocompleteInput(page).press('Enter')
  await tagsAutocompleteInput(page).fill(tagText3)
  await tagsAutocompleteInput(page).press('Enter')
  await tagsSaveButton(page).click()
  // It should show a success snackbar when tags are added and removed, and the drawer should remain open
  await expect(tagsUpdatedSnackbar(page)).toBeVisible()
  await expect(drawer(page)).toBeVisible()

  await closeDrawerButton(page).click()
  // Updated url and tags should be updated on the link row after closing drawer
  await expect(
    linkTableRow.locator('span', { hasText: shortUrl }),
  ).not.toBeVisible()
  await expect(linkTableRow.locator('span', { hasText: subUrl })).toBeVisible()
  await expect(
    linkTableRow.locator('span', { hasText: exactText(tagText1) }),
  ).not.toBeVisible()
  await expect(
    linkTableRow.locator('span', { hasText: exactText(tagText2) }),
  ).toBeVisible()
  await expect(
    linkTableRow.locator('span', { hasText: exactText(tagText3) }),
  ).toBeVisible()

  await linkRow.click()
  // Updated url and tags should be displayed corectly when re-opening drawer
  await expect(longUrl(page)).toHaveValue(`${subUrl}`)
  expect(await tagsAutocompleteTags(page).count()).toBe(2)
  await expect(tag2(page)).toBeVisible()
  await expect(tag3(page)).toBeVisible()

  await longUrl(page).fill('invalid')
  // Error validation (red underline + helperText) appears when value in edit long url textfield is invalid
  await expect(helperText(page)).toBeVisible()

  // "Save" button is disabled (grey and unclickable) when value in edit long url textfield is invalid
  await expect(urlSaveButton(page).locator('xpath=..')).toBeDisabled()

  // Url is updated/saved when user enters a new url, then clicks "save" - check redirect with port 8080
  await activeSwitch(page).nth(0).click()
  await page.goto(`${apiLocation}/${generatedUrl}`)
  // The redirect through the short-link API can take close to 6s; poll
  // instead of the original fixed 6s sleep (evidence for the margin, not
  // for a blind wait).
  await expect(page).toHaveURL((url) => url.href.includes(subUrl), {
    timeout: 8000,
  })
})

test('Drawer functionality test for file.', async ({ page }) => {
  await createLinkButton(page).nth(0).click()
  await generateUrlImage(page).click()

  const generatedFileUrl = await shortUrlTextField(page).inputValue()
  const linkRow = linkRowByShortUrl(page, generatedFileUrl)

  await createEmptyFileOfSize(dummyFilePath, smallFileSize)

  await fileTab(page).click()
  await uploadFile(page).setInputFiles(dummyFilePath)
  await createLinkButton(page).nth(2).click()

  await deleteFile(dummyFilePath)
  await createEmptyFileOfSize(dummyFilePath, largeFileSize)

  await linkRow.click()
  await uploadFile(page).setInputFiles(dummyFilePath)
  await expect(largeFileError(page)).toBeVisible()

  await deleteFile(dummyFilePath)
})

test('Link transfer test.', async ({ page }) => {
  // Fixture already logged in as testEmail. Sign out first so we can prime
  // the transferEmail account (mirrors the original testcafe before-hook).
  await signOutButton(page).click()
  await page.goto(rootLocation)
  await loginProcedure(page, transferEmail)
  await signOutButton(page).click()
  await page.goto(rootLocation)
  await loginProcedure(page, testEmail)

  await createLinkButton(page).nth(0).click()
  await generateUrlImage(page).click()
  await tagsAutocompleteInput(page).fill(tagText1)
  await tagsAutocompleteInput(page).press('Enter')

  const generatedUrl = await shortUrlTextField(page).inputValue()
  const linkRow = linkRowByShortUrl(page, generatedUrl)
  const linkTableRow = linkRow.locator('xpath=ancestor::tr')

  await longUrlTextField(page).fill(`${shortUrl}`)
  await createLinkButton(page).nth(2).click()

  await linkRow.click()
  await linkTransferField(page).fill(`${testEmail}`)
  await transferButton(page).click()
  await linkErrorSnackBar(page).click()
  // Unsuccessful link transfers do not close the drawer.
  await expect(drawer(page)).toBeVisible()

  await linkTransferField(page).fill(`${transferEmail}`)
  await transferButton(page).click()
  // Successful link transfers closes the drawer.
  await expect(drawer(page)).not.toBeVisible()
  // It should show a success snackbar when link is transferred to another user.
  await expect(successSnackBar(page)).toBeVisible()

  // Toasters to not disappear on clickaway (i.e. to prevent premature closure when user clickaway to save url)
  await clickAway(page).click()
  await expect(successSnackBar(page)).toBeVisible()

  // Toasters to disappear when user clicks on the X only
  if ((await successSnackBar(page).count()) > 0) {
    await closeButtonSnackBar(page).click()
  }
  await expect(successSnackBar(page)).not.toBeVisible()

  // Verify the link is in the transfer email
  await signOutButton(page).click()
  await page.goto(rootLocation)

  await loginProcedure(page, transferEmail)

  await expect(linkRow).toBeVisible()

  // Verify the tag is transferred along with the link
  await expect(
    linkTableRow.locator('span', { hasText: exactText(tagText1) }),
  ).toBeVisible()
})

test('Link transfer toast test.', async ({ page }) => {
  await createLinkButton(page).nth(0).click()
  await generateUrlImage(page).click()

  const generatedUrl = await shortUrlTextField(page).inputValue()
  const linkRow = linkRowByShortUrl(page, generatedUrl)

  await longUrlTextField(page).fill(`${shortUrl}`)
  await createLinkButton(page).nth(2).click()

  await linkRow.click()
  await linkTransferField(page).fill(`${testEmail}`)
  await transferButton(page).click()

  // Toasters to disappear after 5sec
  await clickAway(page).click()
  await page.waitForTimeout(5000)
  await expect(successSnackBar(page)).not.toBeVisible()
})
