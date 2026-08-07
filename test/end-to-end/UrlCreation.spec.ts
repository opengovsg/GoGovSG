import { expect } from '@playwright/test'
import { fetch } from 'cross-fetch'
import { test } from './fixtures'
import {
  apiLocation,
  circularRedirectUrl,
  dummyBulkCsv,
  dummyChangedFilePath,
  dummyFilePath,
  dummyMaliciousFilePath,
  invalidShortUrl,
  largeFileSize,
  shortUrl,
  smallFileSize,
  tagText1,
  tagText2,
  tagText3,
} from './util/config'
import {
  blacklistValidationError,
  bulkTab,
  circularRedirectValidationError,
  closeDrawerButton,
  createSubmitButton,
  createUrlModal,
  cssRgbChannels,
  csvOnlyError,
  exactText,
  fileSubmitButton,
  fileTab,
  generateRandomString,
  generateUrlImage,
  getLinkCount,
  largeFileError,
  linkRowByShortUrl,
  longUrlTextField,
  maliciousFileCreation,
  openCreateLinkModal,
  resultTable,
  searchBarLinkButton,
  searchBarLinksInput,
  searchBarSearchByTag,
  searchBarTagButton,
  searchBarTagsInput,
  shortUrlTextField,
  successBulkCreation,
  successLinkUpdate,
  successUrlCreation,
  tag1,
  tag3,
  tagCloseButton1,
  tagsAutocompleteInput,
  unavailableShortLink,
  uploadFile,
  urlTable,
} from './util/helpers'
import { firstLinkHandle } from './util/FirstLinkHandle'
import { gotoPage } from './util/navigation'
import { userLinksRefetch } from './util/waits'
import {
  createBulkCsv,
  createEmptyFileOfSize,
  createMaliciousFile,
  deleteFile,
} from './util/fileHandle'
import { linkCreationProcedure } from './util/LinkCreationProcedure'

test('The URL based shortlink test.', async ({ page }) => {
  // The create url modal opens when the "Create link" button is clicked.
  await openCreateLinkModal(page)
  await expect(createUrlModal(page)).toBeVisible()

  // It should populate the short url input box on the create url modal with a random string when the refresh icon on the short url input box is pressed
  await generateUrlImage(page).click()
  await expect(shortUrlTextField(page)).not.toHaveValue('')

  const generatedUrl = await shortUrlTextField(page).inputValue()
  const linkRow = linkRowByShortUrl(page, generatedUrl)
  const linkTableRow = linkRow.locator('xpath=ancestor::tr[1]')

  // It should prevent creation of short urls pointing to long urls hosted on blacklisted domains
  await longUrlTextField(page).fill(`${invalidShortUrl}`)

  await createSubmitButton(page).click()

  await expect(blacklistValidationError(page)).toBeVisible()

  // It should prevent creation of short urls pointing to long urls hosted on our domains (circular redirects)
  await longUrlTextField(page).fill(`${circularRedirectUrl}`)

  await createSubmitButton(page).click()

  await expect(circularRedirectValidationError(page)).toBeVisible()

  // Add and remove tags from the tags autocomplete field
  await tagsAutocompleteInput(page).fill(tagText1)
  await tagsAutocompleteInput(page).press('Enter')
  await tagsAutocompleteInput(page).fill(tagText2)
  await tagsAutocompleteInput(page).press('Enter')
  await tagCloseButton1(page).click()

  await longUrlTextField(page).fill(`${shortUrl}`)

  await firstLinkHandle(page)

  // It should show an success snackbar when a new url has been added
  await expect(successUrlCreation(page)).toBeVisible()
  // It should show the new short url on the user's links table when a new link is created
  await expect(linkRow).toBeVisible()
  // The new short url should be highlighted on the user's links table when a new link is created
  expect(
    cssRgbChannels(
      await urlTable(page)
        .locator('xpath=./*')
        .nth(0)
        .evaluate((el) => getComputedStyle(el).backgroundColor),
    ),
  ).toBe(cssRgbChannels('rgb(249, 249, 249)'))
  // It should show the tag on the new short url
  await expect(
    linkTableRow.locator('span', { hasText: exactText(tagText2) }),
  ).toBeVisible()

  // It should show an autocomplete option for the previously created tag when creating a new link
  await openCreateLinkModal(page)
  await tagsAutocompleteInput(page).fill('tag')
  // TableTag chips on existing rows are contained buttons; suggestions use text buttons.
  await expect(
    page.locator('button.MuiButton-text', { hasText: exactText(tagText2) }),
  ).toBeVisible()
})

test('The file based shortlink test.', async ({ page }) => {
  await openCreateLinkModal(page)
  await generateUrlImage(page).click()

  const generatedfileUrl = await shortUrlTextField(page).inputValue()
  const fileRow = linkRowByShortUrl(page, generatedfileUrl)
  const fileTableRow = fileRow.locator('xpath=ancestor::tr[1]')

  // Generate 1mb file
  await createEmptyFileOfSize(dummyFilePath, smallFileSize)

  await fileTab(page).click()
  await uploadFile(page).setInputFiles(dummyFilePath)
  await tagsAutocompleteInput(page).fill(tagText1)
  await tagsAutocompleteInput(page).press('Enter')
  await firstLinkHandle(page)

  // It should show an success snackbar when a new file link has been added
  await expect(successUrlCreation(page)).toBeVisible()
  // It should show the short url on the user's link table when a new file link is created
  await expect(fileRow).toBeVisible()
  // The new short url should be highlighted on the user's links table when a new file link is created
  expect(
    cssRgbChannels(
      await urlTable(page)
        .locator('xpath=./*')
        .nth(0)
        .evaluate((el) => getComputedStyle(el).backgroundColor),
    ),
  ).toBe(cssRgbChannels('rgb(249, 249, 249)')) // #f9f9f9 in rgb
  // It should show the tags on the new short url
  await expect(
    fileTableRow.locator('span', { hasText: exactText(tagText1) }),
  ).toBeVisible()

  // Delete 1mb file
  await deleteFile(dummyFilePath)

  // Generate 11mb file
  await createEmptyFileOfSize(dummyFilePath, largeFileSize)

  await openCreateLinkModal(page)
  await fileTab(page).click()
  await uploadFile(page).setInputFiles(dummyFilePath)
  // It should clear tags input after the previous link was successfully created
  await expect(tag1(page)).not.toBeVisible()
  // It should show an error below the file input when a file larger than 20MB is chosen
  await expect(largeFileError(page)).toBeVisible()

  // It should disable the submit button when a file larger than 20MB is chosen
  await expect(fileSubmitButton(page)).toBeDisabled()

  // Delete 11mb file
  await deleteFile(dummyFilePath)
})

test('The URL searching test.', async ({ page }) => {
  await openCreateLinkModal(page)
  await generateUrlImage(page).click()

  const generatedUrlActive = await shortUrlTextField(page).inputValue()
  const randomTagText = generateRandomString(10)

  // testcafe's typeText appends to the existing generated value rather than
  // replacing it -- replicate that by filling with the concatenated string.
  await shortUrlTextField(page).fill(`${generatedUrlActive}-search`)
  await longUrlTextField(page).fill(`${shortUrl}`)
  await tagsAutocompleteInput(page).fill(randomTagText)
  await tagsAutocompleteInput(page).press('Enter')
  await firstLinkHandle(page)

  // testcafe selectors are lazily re-queried on each use, so keep this as a
  // Locator (not an awaited string) to mirror re-evaluation on every assert.
  const tableText = resultTable(page)
    .locator('xpath=./tbody')
    .locator('xpath=./*')
    .nth(0)
    .locator('xpath=./*')
    .nth(1)
    .locator('xpath=./*')
    .nth(0)
    .locator('xpath=./*')
    .nth(0)
    .locator('xpath=./h6')

  // Bound to this query: the refetch from creating the link above may still be
  // in flight and would otherwise satisfy the wait.
  const linkSearch = userLinksRefetch(page, { searchText: 'search' })
  await searchBarLinksInput(page).fill('search')
  await linkSearch
  // Searching on the user page search bar shows links that are relevant to the search term.
  await expect(tableText).toHaveText(`/${generatedUrlActive}-search`)

  await searchBarLinkButton(page).click()
  await searchBarSearchByTag(page).click()
  // Toggling the search bar to search by tags should change button text and clear search input
  await expect(searchBarTagButton(page)).toBeVisible()
  expect(await searchBarTagsInput(page).innerText()).toBe('')

  // Await the refetch: clearing the input above already put this link back on
  // top, so a bare assertion could pass before the tag query ever ran.
  const tagSearch = userLinksRefetch(page)
  await searchBarTagsInput(page).fill(randomTagText)
  await tagSearch
  // Searching by tags on the user page search bar shows links that are relevant to the search term.
  await expect(tableText).toHaveText(`/${generatedUrlActive}-search`)
})

test('The bulk based test.', async ({ page }) => {
  await openCreateLinkModal(page)

  const longUrls = Array(100).fill('https://google.com')
  const currLinkCount = await getLinkCount(page)
  const expectedLinkCount = currLinkCount + longUrls.length

  // valid file
  await createBulkCsv(dummyBulkCsv, longUrls)

  await bulkTab(page).click()
  await uploadFile(page).setInputFiles(dummyBulkCsv)
  await tagsAutocompleteInput(page).fill(tagText3)
  await tagsAutocompleteInput(page).press('Enter')
  await firstLinkHandle(page)

  // It should show an success snackbar when a new file link has been added
  await expect(successBulkCreation(page)).toBeVisible()
  // The number of links should increase by numLongUrls. Poll: the count header
  // updates on the table refetch, which trails the snackbar.
  await expect.poll(() => getLinkCount(page)).toBe(expectedLinkCount)
  // It should show tags on the newly created short urls
  await expect(
    urlTable(page)
      .locator('xpath=./*')
      .nth(0)
      .locator('span', { hasText: exactText(tagText3) }),
  ).toBeVisible()

  // Delete valid file
  await deleteFile(dummyBulkCsv)

  // invalid file (non-csv)
  await createEmptyFileOfSize(dummyFilePath, smallFileSize)

  await openCreateLinkModal(page)
  await bulkTab(page).click()
  await uploadFile(page).setInputFiles(dummyFilePath)
  // It should clear tags input after bulk creation was successful
  await expect(tag3(page)).not.toBeVisible()
  await createSubmitButton(page).click()
  await expect(csvOnlyError(page)).toBeVisible()

  // Delete invalid file (non-csv)
  await deleteFile(dummyFilePath)
})

test.skip('The malicious file test.', async ({ page }) => {
  await openCreateLinkModal(page)
  await generateUrlImage(page).click()

  const generatedfileUrl = await shortUrlTextField(page).inputValue()

  // Generate Malicious file
  await createMaliciousFile()

  await fileTab(page).click()
  await uploadFile(page).setInputFiles(dummyMaliciousFilePath)
  await tagsAutocompleteInput(page).fill(tagText1)
  await tagsAutocompleteInput(page).press('Enter')
  await createSubmitButton(page).click()

  // It should show an error snackbar when malicious file uploaded
  await expect(maliciousFileCreation(page)).toBeVisible()

  await deleteFile(dummyMaliciousFilePath)

  // Check that row is not created
  const linkRow = linkRowByShortUrl(page, generatedfileUrl)

  await expect(linkRow).not.toBeVisible()
})

test('The update file test', async ({ page }) => {
  await openCreateLinkModal(page)
  await generateUrlImage(page).click()

  const generatedfileUrl = await shortUrlTextField(page).inputValue()
  const fileRow = linkRowByShortUrl(page, generatedfileUrl)

  // Generate 1mb file
  await createEmptyFileOfSize(dummyFilePath, smallFileSize)

  await fileTab(page).click()
  await uploadFile(page).setInputFiles(dummyFilePath)
  await tagsAutocompleteInput(page).fill(tagText1)
  await tagsAutocompleteInput(page).press('Enter')
  await firstLinkHandle(page)
  await expect(successUrlCreation(page)).toBeVisible()

  await createEmptyFileOfSize(dummyChangedFilePath, smallFileSize)
  await fileRow.click()
  await uploadFile(page).setInputFiles(dummyChangedFilePath)
  await expect(successLinkUpdate(page)).toBeVisible()
  await closeDrawerButton(page).click()

  // Assert redirect target, not Playwright's download event. S3 objects have no
  // Content-Disposition: attachment, so WebKit opens them inline and never
  // emits download. Replace changes anotherDummy.txt -> changedDummy.csv, so
  // the object key must end in .csv. Googlebot skips the transition page.
  const redirectResponse = await fetch(`${apiLocation}/${generatedfileUrl}`, {
    redirect: 'manual',
    headers: { 'User-Agent': 'Googlebot/2.1' },
  })
  expect(redirectResponse.status).toBe(302)
  const location = redirectResponse.headers.get('location')
  expect(location).toContain(`/${generatedfileUrl}.csv`)
  if (!location) {
    throw new Error(`Missing Location header for /${generatedfileUrl}`)
  }

  const fileResponse = await fetch(location)
  expect(fileResponse.ok).toBeTruthy()

  await deleteFile(dummyFilePath)
  await deleteFile(dummyChangedFilePath)
})

test('Test active and inactive link redirects', async ({ page }) => {
  const { generatedUrlActive, generatedUrlInactive } =
    await linkCreationProcedure(page)

  // Check inactive link
  const inactiveResult = await fetch(`${apiLocation}/${generatedUrlInactive}`)
  expect(inactiveResult.status === 404).toBeTruthy()
  await gotoPage(page, `${apiLocation}/${generatedUrlInactive}`)
  await expect(unavailableShortLink(page)).toBeVisible()

  // Check active link redirect. The transition page holds ~6s; poll so this
  // exits on the redirect, with a budget clear of that timer.
  await gotoPage(page, `${apiLocation}/${generatedUrlActive}`)
  await expect(page).toHaveURL((url) => url.host === 'www.google.com', {
    timeout: 15_000,
  })
})
