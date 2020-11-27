import { Selector } from 'testcafe'
import { getRootLocation } from './util/config'
import {
  createLinkButton,
  createUrlModal,
  fileTab,
  generateUrlImage,
  longUrlTextField,
  resultTable,
  searchBar,
  shortUrlTextField,
  successUrlCreation,
  uploadFile,
  urlTable,
  validationError,
} from './util/helpers'
import LoginProcedure from './util/Login-Procedure'

const location = getRootLocation()

// eslint-disable-next-line no-undef
fixture(`URL Creation`)
  .page(`${location}`)
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
  await t.typeText(longUrlTextField, 'bit.ly')

  if (await createLinkButton.nth(2).exists) {
    await t.click(createLinkButton.nth(2))
  } else {
    await t.click(createLinkButton.nth(1))
  }

  await t.expect(validationError.exists).ok()

  await t
    .click(longUrlTextField)
    .pressKey('ctrl+a delete')
    .typeText(longUrlTextField, 'google.com')

  if (await createLinkButton.nth(2).exists) {
    await t.click(createLinkButton.nth(2))
  } else {
    await t.click(createLinkButton.nth(1))
  }

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

  await t
    .click(fileTab)
    .setFilesToUpload(uploadFile, './util/dummyFile.txt')
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
})

test('The URL searching test.', async (t) => {
  await t.click(createLinkButton.nth(0)).click(generateUrlImage)

  const generatedUrlActive = await shortUrlTextField.value

  await t
    .typeText(shortUrlTextField, '-search')
    .typeText(longUrlTextField, 'google.com')
    .click(createLinkButton.nth(2))

  await t
    .typeText(searchBar, 'search')
    .wait(1000)
    // Searching on the user page search bar shows links that are relevant to the search term.
    // eslint-disable-next-line
    .expect(resultTable.child('tbody').child(0).child(1).child(0).child(0).child('h6').innerText)
    .eql(`/${generatedUrlActive}-search`)
})

/*
 * Unable to cover the following:
 * It should show an error below the file input when a file larger than 10MB is chosen
 * It should disable the submit button when a file larger than 10MB is chosen
 * It should prevent uploading when a malicious file is submitted
 * Clicking on the download button downloads all link currently shown in the links table as a .csv file.
 */
