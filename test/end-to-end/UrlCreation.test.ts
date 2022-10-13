import { Selector } from 'testcafe'
import {
  circularRedirectUrl,
  dummyBulkCsv,
  dummyBulkCsvRelativePath,
  dummyFilePath,
  dummyRelativePath,
  invalidShortUrl,
  largeFileSize,
  rootLocation,
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
  createLinkButton,
  createUrlModal,
  csvOnlyError,
  fileSubmitButton,
  fileTab,
  generateRandomString,
  generateUrlImage,
  getLinkCount,
  largeFileError,
  longUrlTextField,
  resultTable,
  searchBarLinkButton,
  searchBarLinksInput,
  searchBarSearchByTag,
  searchBarTagButton,
  searchBarTagsInput,
  shortUrlTextField,
  successBulkCreation,
  successUrlCreation,
  tag1,
  tag3,
  tagCloseButton1,
  tagsAutocompleteInput,
  uploadFile,
  urlTable,
} from './util/helpers'
import LoginProcedure from './util/LoginProcedure'
import firstLinkHandle from './util/FirstLinkHandle'
import {
  createBulkCsv,
  createEmptyFileOfSize,
  deleteFile,
} from './util/fileHandle'

// eslint-disable-next-line no-undef
fixture(`URL Creation`)
  .page(`${rootLocation}`)
  .beforeEach(async (t) => {
    await LoginProcedure(t)
  })

test('The URL based shortlink test.', async (t) => {
  // The create url modal opens when the "Create link" button is clicked.
  await t.click(createLinkButton.nth(0)).expect(createUrlModal.exists).ok()

  // It should populate the short url input box on the create url modal with a random string when the refresh icon on the short url input box is pressed
  await t.click(generateUrlImage).expect(shortUrlTextField.value).notEql('')

  const generatedUrl = await shortUrlTextField.value
  const linkRow = Selector(`h6[title="${generatedUrl}"]`)
  const linkTableRow = linkRow.parent('tr')

  // It should prevent creation of short urls pointing to long urls hosted on blacklisted domains
  await t.typeText(longUrlTextField, `${invalidShortUrl}`)

  if (await createLinkButton.nth(2).exists) {
    await t.click(createLinkButton.nth(2))
  } else {
    await t.click(createLinkButton.nth(1))
  }

  await t.expect(blacklistValidationError.exists).ok()

  // It should prevent creation of short urls pointing to long urls hosted on our domains (circular redirects)
  await t
    .click(longUrlTextField)
    .pressKey('ctrl+a delete')
    .typeText(longUrlTextField, `${circularRedirectUrl}`)

  if (await createLinkButton.nth(2).exists) {
    await t.click(createLinkButton.nth(2))
  } else {
    await t.click(createLinkButton.nth(1))
  }

  await t.expect(circularRedirectValidationError.exists).ok()

  // Add and remove tags from the tags autocomplete field
  await t
    .click(tagsAutocompleteInput)
    .typeText(tagsAutocompleteInput, tagText1)
    .pressKey('enter')
    .typeText(tagsAutocompleteInput, tagText2)
    .pressKey('enter')
    .click(tagCloseButton1)

  await t
    .click(longUrlTextField)
    .pressKey('ctrl+a delete')
    .typeText(longUrlTextField, `${shortUrl}`)

  await firstLinkHandle(t)

  await t
    // It should show an success snackbar when a new url has been added
    .expect(successUrlCreation.exists)
    .ok()
    // It should show the new short url on the user's links table when a new link is created
    .expect(linkRow.exists)
    .ok()
    // The new short url should be highlighted on the user's links table when a new link is created
    .expect(urlTable.child(0).getStyleProperty('background-color'))
    .eql('rgb(249, 249, 249)')
    // It should show the tag on the new short url
    .expect(linkTableRow.find('span').withExactText(tagText2).exists)
    .ok()

  // It should show an autocomplete option for the previously created tag when creating a new link
  await t
    .click(createLinkButton.nth(0))
    .typeText(tagsAutocompleteInput, 'tag')
    .wait(1000)
    .expect(Selector('button').withExactText(tagText2).exists)
    .ok()
})

test('The file based shortlink test.', async (t) => {
  await t.click(createLinkButton.nth(0)).click(generateUrlImage)

  const generatedfileUrl = await shortUrlTextField.value
  const fileRow = Selector(`h6[title="${generatedfileUrl}"]`)
  const fileTableRow = fileRow.parent('tr')

  // Generate 1mb file
  await createEmptyFileOfSize(dummyFilePath, smallFileSize)

  await t
    .click(fileTab)
    .setFilesToUpload(uploadFile, dummyRelativePath)
    .click(tagsAutocompleteInput)
    .typeText(tagsAutocompleteInput, tagText1)
    .pressKey('enter')
    .click(createLinkButton.nth(2))

  await t
    // It should show an success snackbar when a new file link has been added
    .expect(successUrlCreation.exists)
    .ok()
    // It should show the short url on the user's link table when a new file link is created
    .expect(fileRow.exists)
    .ok()
    // The new short url should be highlighted on the user's links table when a new file link is created
    .expect(urlTable.child(0).getStyleProperty('background-color'))
    .eql('rgb(249, 249, 249)') // #f9f9f9 in rgb
    // It should show the tags on the new short url
    .expect(fileTableRow.find('span').withExactText(tagText1).exists)
    .ok()

  // Delete 1mb file
  await deleteFile(dummyFilePath)

  // Generate 11mb file
  await createEmptyFileOfSize(dummyFilePath, largeFileSize)

  await t
    .click(createLinkButton.nth(0))
    .click(fileTab)
    .setFilesToUpload(uploadFile, dummyRelativePath)
    // It should clear tags input after the previous link was successfully created
    .expect(tag1.exists)
    .notOk()
    // It should show an error below the file input when a file larger than 10MB is chosen
    .expect(largeFileError.exists)
    .ok()

  // It should disable the submit button when a file larger than 10MB is chosen
  await t.expect(fileSubmitButton.hasAttribute('disabled')).ok()

  // Delete 11mb file
  await deleteFile(dummyFilePath)
})

test('The URL searching test.', async (t) => {
  await t.click(createLinkButton.nth(0)).click(generateUrlImage)

  const generatedUrlActive = await shortUrlTextField.value
  const randomTagText = generateRandomString(10)

  await t
    .typeText(shortUrlTextField, '-search')
    .typeText(longUrlTextField, `${shortUrl}`)
    .click(tagsAutocompleteInput)
    .typeText(tagsAutocompleteInput, randomTagText)
    .pressKey('enter')
    .click(createLinkButton.nth(2))

  await t
    .typeText(searchBarLinksInput, 'search')
    .wait(1000)
    // Searching on the user page search bar shows links that are relevant to the search term.
    // eslint-disable-next-line
    .expect(resultTable.child('tbody').child(0).child(1).child(0).child(0).child('h6').innerText)
    .eql(`/${generatedUrlActive}-search`)

  await t
    .click(searchBarLinkButton)
    .click(searchBarSearchByTag)
    // Toggling the search bar to search by tags should change button text and clear search input
    .expect(searchBarTagButton.exists)
    .ok()
    .expect(searchBarTagsInput.innerText)
    .eql('')

  await t
    .typeText(searchBarTagsInput, randomTagText)
    .wait(3000)
    // Searching by tags on the user page search bar shows links that are relevant to the search term.
    // eslint-disable-next-line
    .expect(resultTable.child('tbody').child(0).child(1).child(0).child(0).child('h6').innerText)
    .eql(`/${generatedUrlActive}-search`)
})

test('The bulk based test.', async (t) => {
  await t.click(createLinkButton.nth(0))

  const longUrls = Array(100).fill('https://google.com')
  const currLinkCount = await getLinkCount()
  const expectedLinkCount = currLinkCount + longUrls.length

  // valid file
  await createBulkCsv(dummyBulkCsv, longUrls)

  await t
    .click(bulkTab)
    .setFilesToUpload(uploadFile, dummyBulkCsvRelativePath)
    .click(tagsAutocompleteInput)
    .typeText(tagsAutocompleteInput, tagText3)
    .pressKey('enter')
    .click(createLinkButton.nth(2))

  await t.wait(1000)

  await t
    // It should show an success snackbar when a new file link has been added
    .expect(successBulkCreation.exists)
    .ok()
    // The number of links should increase by numLongUrls
    .expect(await getLinkCount())
    .eql(expectedLinkCount)
    // It should show tags on the newly created short urls
    .expect(urlTable.child(0).find('span').withExactText(tagText3).exists)
    .ok()

  // Delete valid file
  await deleteFile(dummyBulkCsv)

  // invalid file (non-csv)
  await createEmptyFileOfSize(dummyFilePath, smallFileSize)

  await t
    .click(createLinkButton.nth(0))
    .click(bulkTab)
    .setFilesToUpload(uploadFile, dummyRelativePath)
    // It should clear tags input after bulk creation was successful
    .expect(tag3.exists)
    .notOk()
    .click(createLinkButton.nth(2))
    .expect(csvOnlyError.exists)
    .ok()

  // Delete invalid file (non-csv)
  await deleteFile(dummyFilePath)
})
