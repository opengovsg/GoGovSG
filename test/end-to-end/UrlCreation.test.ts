/* eslint-disable import/no-extraneous-dependencies */
import { Selector } from 'testcafe'
import {
  dummyFilePath,
  dummyRelativePath,
  invalidShortUrl,
  largeFileSize,
  rootLocation,
  shortUrl,
  smallFileSize,
} from './util/config'
import {
  createLinkButton,
  createUrlModal,
  fileSubmitButton,
  fileTab,
  generateUrlImage,
  largeFileError,
  longUrlTextField,
  resultTable,
  searchBar,
  shortUrlTextField,
  successUrlCreation,
  uploadFile,
  urlTable,
  validationError,
} from './util/helpers'
import LoginProcedure from './util/LoginProcedure'
import firstLinkHandle from './util/FirstLinkHandle'
import { createEmptyFileOfSize, deleteFile } from './util/fileHandle'

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

  // It should prevent creation of short urls pointing to long urls hosted on blacklisted domains
  await t.typeText(longUrlTextField, `${invalidShortUrl}`)

  if (await createLinkButton.nth(2).exists) {
    await t.click(createLinkButton.nth(2))
  } else {
    await t.click(createLinkButton.nth(1))
  }

  await t.expect(validationError.exists).ok()

  await t
    .click(longUrlTextField)
    .pressKey('ctrl+a delete')
    .typeText(longUrlTextField, `${shortUrl}`)

  await firstLinkHandle(t)

  await t
    // It should show an success snackbar when a new url has been added
    .expect(successUrlCreation.exists)
    .ok()
    // It should show the new short url on the users’ links table when a new link is created
    .expect(linkRow.exists)
    .ok()
    // The new short url should be highlighted on the users' links table when a new link is created
    .expect(urlTable.child(0).getStyleProperty('background-color'))
    .eql('rgb(249, 249, 249)')
})

test('The file based shortlink test.', async (t) => {
  await t.click(createLinkButton.nth(0)).click(generateUrlImage)

  const generatedfileUrl = await shortUrlTextField.value
  const fileRow = Selector(`h6[title="${generatedfileUrl}"]`)

  // Generate 1mb file
  await createEmptyFileOfSize(dummyFilePath, smallFileSize)

  await t
    .click(fileTab)
    .setFilesToUpload(uploadFile, dummyRelativePath)
    .click(createLinkButton.nth(2))
    // It should show an success snackbar when a new file link has been added
    .expect(successUrlCreation.exists)
    .ok()
    // It should show the short url on users' link table when a new file link is created
    .expect(fileRow.exists)
    .ok()
    // The new short url should be highlighted on the users' links table when a new file link is created
    .expect(urlTable.child(0).getStyleProperty('background-color'))
    .eql('rgb(249, 249, 249)') // #f9f9f9 in rgb

  // Delete 1mb file
  await deleteFile(dummyFilePath)

  // Generate 11mb file
  await createEmptyFileOfSize(dummyFilePath, largeFileSize)

  await t
    .click(createLinkButton.nth(0))
    .click(fileTab)
    .setFilesToUpload(uploadFile, dummyRelativePath)
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

  await t
    .typeText(shortUrlTextField, '-search')
    .typeText(longUrlTextField, `${shortUrl}`)
    .click(createLinkButton.nth(2))

  await t
    .typeText(searchBar, 'search')
    .wait(1000)
    // Searching on the user page search bar shows links that are relevant to the search term.
    // eslint-disable-next-line
    .expect(resultTable.child('tbody').child(0).child(1).child(0).child(0).child('h6').innerText)
    .eql(`/${generatedUrlActive}-search`)
})
