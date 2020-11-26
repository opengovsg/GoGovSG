import { Selector } from 'testcafe'
import { getOtp, getRootLocation, testEmail } from './util/config'
import {
  createLinkButton,
  createUrlModal,
  fileTab,
  generateUrlImage,
  loginButton,
  loginSuccessAlert,
  longUrlTextField,
  resultTable,
  searchBar,
  shortUrlTextField,
  signInButton,
  successUrlCreation,
  uploadFile,
  urlTable,
  userModal,
  userModalCloseButton,
  validationError,
} from './util/helpers'

const location = getRootLocation()

// eslint-disable-next-line no-undef
fixture(`URL Creation`).page(`${location}`)

test('The URL based shortlink test.', async (t) => {
  /*
   * The create url modal opens when the "Create link" button is clicked.
   * It should populate the short url input box on the create url modal with a random string when the refresh icon on the short url input box is pressed
   * The new short url should be highlighted on the users' links table when a new link is created
   * It should show the new short url on the users’ links table when a new link is created
   * It should prevent creation of short urls pointing to long urls hosted on blacklisted domains
   * It should show an success snackbar when a new url has been added
   */
  await t
    // Login Procedure
    .click(loginButton)
    .typeText('#email', `${testEmail}`)
    .click(signInButton.nth(0))

  const otp = await getOtp()

  await t
    .typeText('#otp', otp)
    .click(signInButton.nth(1))
    .click(loginSuccessAlert)

  // Close announcement modal
  if (await userModal.exists) {
    await t.click(userModalCloseButton)
  }

  // createUrlModal appear on click
  await t.click(createLinkButton.nth(0)).expect(createUrlModal.exists).ok()

  // generate random shorturl on click generate and save it for verification
  await t.click(generateUrlImage).expect(shortUrlTextField.value).notEql('')

  // Assign the newly generated shortUrl to a selector to cross-check on the table
  const generatedUrl = await shortUrlTextField.value
  const linkRow = Selector(`h6[title="${generatedUrl}"]`)

  // type prohibited url will give error
  await t.typeText(longUrlTextField, 'bit.ly')

  // if it is the first link to be created, need to click on index 1 button
  if (await createLinkButton.nth(2).exists) {
    await t.click(createLinkButton.nth(2))
  } else {
    await t.click(createLinkButton.nth(1))
  }

  await t.expect(validationError.exists).ok()

  // creation of new url
  await t
    .click(longUrlTextField)
    .pressKey('ctrl+a delete')
    .typeText(longUrlTextField, 'google.com')

  // if it is the first link to be created, need to click on index 1 button
  if (await createLinkButton.nth(2).exists) {
    await t.click(createLinkButton.nth(2))
  } else {
    await t.click(createLinkButton.nth(1))
  }

  await t
    .expect(successUrlCreation.exists)
    .ok()
    .expect(linkRow.exists)
    .ok()
    .expect(urlTable.child(0).getStyleProperty('background-color'))
    .eql('rgb(249, 249, 249)')
})

test('The file shortlink based.', async (t) => {
  /*
   * The new short url should be highlighted on the users' links table when a new file link is created
   * It should show an success snackbar when a new file link has been added
   * It should show the short url on users' link table when a new file link is created
   */
  await t
    // Login Procedure
    .click(loginButton)
    .typeText('#email', `${testEmail}`)
    .click(signInButton.nth(0))

  const otp = await getOtp()

  await t
    .typeText('#otp', otp)
    .click(signInButton.nth(1))
    .click(loginSuccessAlert)

  // Close announcement modal
  if (await userModal.exists) {
    await t.click(userModalCloseButton)
  }
  // createUrlModal appear on click
  await t.click(createLinkButton.nth(0)).click(generateUrlImage)

  await t
    .click(fileTab)
    .setFilesToUpload(uploadFile, './util/dummyFile.txt')
    .click(createLinkButton.nth(2))
    .expect(successUrlCreation.exists)
    .ok()
    .expect(urlTable.child(0).getStyleProperty('background-color'))
    .eql('rgb(249, 249, 249)') // #f9f9f9 in rgb
})

test('The URL searching and download test.', async (t) => {
  /*
   * Searching on the user page search bar shows links that are relevant to the search term.
   */
  await t
    // Login Procedure
    .click(loginButton)
    .typeText('#email', `${testEmail}`)
    .click(signInButton.nth(0))

  const otp = await getOtp()

  await t
    .typeText('#otp', otp)
    .click(signInButton.nth(1))
    .click(loginSuccessAlert)

  // Close announcement modal
  if (await userModal.exists) {
    await t.click(userModalCloseButton)
  }

  // create link procedure - generate short url
  await t.click(createLinkButton.nth(0)).click(generateUrlImage)

  // Assign the newly generated shortUrl to a selector to cross-check on the table
  const generatedUrlActive = await shortUrlTextField.value

  // create link procedure - create the link
  await t
    .typeText(shortUrlTextField, '-search')
    .typeText(longUrlTextField, 'google.com')
    .click(createLinkButton.nth(2))

  await t
    .typeText(searchBar, 'search')
    .wait(1000)
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
