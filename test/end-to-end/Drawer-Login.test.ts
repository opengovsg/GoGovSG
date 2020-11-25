import { Selector } from 'testcafe'
import {
  getOtp,
  getRootLocation,
  testEmail,
  transferEmail,
} from './util/config'
import {
  activeSwitch,
  clickAway,
  closeButtonSnackBar,
  createLinkButton,
  drawer,
  generateUrlImage,
  helperText,
  inactiveWord,
  linkErrorSnackBar,
  linkTransferField,
  loginButton,
  loginSuccessAlert,
  longUrl,
  longUrlTextField,
  shortUrlTextField,
  signInButton,
  signOutButton,
  successSnackBar,
  transferButton,
  urlSaveButton,
  urlUpdatedToaster,
  userModal,
  userModalCloseButton,
} from './util/helpers'

const location = getRootLocation()

// eslint-disable-next-line no-undef
fixture(`Drawer Page`).page(`${location}`)

test('The URL based shortlink test.', async (t) => {
  /*
   * Drawer should open with the correct long url and state when a short url row is clicked
   * Drawer can be closed on clickaway or when the close button is clicked.
   * It should set short url active or inactive immediately when the toggle is switched (any caching for that short url is cleared)
   * It should show a success snackbar when long url is changed
   * Url is updated/saved when user enters a new url, then clicks "save"
   * Url is reverts to original when user enters a new url, then re-opens the drawer without clicking "save"
   * Error validation (red underline + helperText) appears when value in edit long url textfield is invalid
   * "Save" button is disabled (grey and unclickable) when value in edit long url textfield is invalid
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
  const generatedUrl = await shortUrlTextField.value
  const linkRow = Selector(`h6[title="${generatedUrl}"]`)

  // create link procedure - create the link
  await t.typeText(longUrlTextField, 'google.com')

  // if it is the first link to be created, need to click on index 1 button
  if (await createLinkButton.nth(2).exists) {
    await t.click(createLinkButton.nth(2))
  } else {
    await t.click(createLinkButton.nth(1))
  }

  // Open drawer and check long url
  await t
    .click(linkRow)
    .expect(drawer.exists)
    .ok()
    .expect(longUrl.value)
    .eql('google.com')

  // Drawer can be closed on clickaway or when the close button is clicked.
  await t
    .click(drawer.child(2).child('main').child('button'))
    .expect(drawer.exists)
    .notOk()

  // It should set short url active or inactive immediately when the toggle is switched (any caching for that short url is cleared)
  await t
    .click(linkRow)
    .click(activeSwitch.nth(0))
    .expect(inactiveWord.exists)
    .ok()

  // Url is reverts to original when user enters a new url, then re-opens the drawer without clicking "save"
  await t
    .click(longUrl)
    .pressKey('ctrl+a delete')
    .typeText(longUrl, 'yahoo.com')
    .click(drawer.child(2).child('main').child('button'))
    .click(linkRow)
    .expect(longUrl.value)
    .eql('google.com')

  // It should show a success snackbar when long url is changed
  await t
    .click(longUrl)
    .pressKey('ctrl+a delete')
    .typeText(longUrl, 'yahoo.com')
    .click(urlSaveButton)
    .expect(urlUpdatedToaster.exists)
    .ok()

  // Url is updated/saved when user enters a new url, then clicks "save"
  await t
    .click(drawer.child(2).child('main').child('button'))
    .click(linkRow)
    .expect(longUrl.value)
    .eql('yahoo.com')

  // Error validation (red underline + helperText) appears when value in edit long url textfield is invalid
  await t
    .click(longUrl)
    .pressKey('ctrl+a delete')
    .typeText(longUrl, 'invalid')
    .expect(helperText.exists)
    .ok()

  // "Save" button is disabled (grey and unclickable) when value in edit long url textfield is invalid
  await t.expect(urlSaveButton.parent(0).hasAttribute('disabled')).ok()
})

test.before(async (t) => {
  // login to the transfer email to activate it, then logout
  await t
    // Login Procedure
    .click(loginButton)
    .typeText('#email', `${transferEmail}`)
    .click(signInButton.nth(0))

  const otp = await getOtp()

  await t.typeText('#otp', otp).click(signInButton.nth(1))

  // Close announcement modal
  if (await userModal.exists) {
    await t.click(userModalCloseButton)
  }

  await t.click(signOutButton).navigateTo(`${location}`)
})('The link transfer test - 1.', async (t) => {
  /*
   * Unsuccessful link transfers do not close the drawer.
   * Successful link transfers closes the drawer.
   * Toasters to not disappear on clickaway (i.e. to prevent premature closure when user clickaway to save url)
   * Toasters to disappear when user clicks on the X only
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
  const generatedUrl = await shortUrlTextField.value
  const linkRow = Selector(`h6[title="${generatedUrl}"]`)

  // create link procedure - create the link
  await t
    .typeText(longUrlTextField, 'google.com')
    .click(createLinkButton.nth(2))

  // Unsuccessful link transfers do not close the drawer.
  await t
    .click(linkRow)
    .typeText(linkTransferField, `${testEmail}`)
    .click(transferButton)
    .click(linkErrorSnackBar)
    .expect(drawer.exists)
    .ok()

  //  Successful link transfers closes the drawer.
  await t
    .click(linkTransferField)
    .pressKey('ctrl+a delete')
    .typeText(linkTransferField, `${transferEmail}`)
    .click(transferButton)
    .expect(drawer.exists)
    .notOk()
    .expect(successSnackBar.exists)
    .ok()

  // Toasters to not disappear on clickaway (i.e. to prevent premature closure when user clickaway to save url)
  await t.click(clickAway).expect(successSnackBar.exists).ok()

  // Toasters to disappear when user clicks on the X only
  if (await successSnackBar.exists) {
    await t.click(closeButtonSnackBar)
  }
  await t.expect(successSnackBar.exists).notOk()
})

test('The link transfer test - 2.', async (t) => {
  /*
   * Toasters to disappear after 5sec
   */
  await t
    // Login Procedure
    .click(loginButton)
    .typeText('#email', `${testEmail}`)
    .click(signInButton.nth(0))
    .wait(5000)

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
  const generatedUrl = await shortUrlTextField.value
  const linkRow = Selector(`h6[title="${generatedUrl}"]`)

  // create link procedure - create the link
  await t
    .typeText(longUrlTextField, 'google.com')
    .click(createLinkButton.nth(2))

  // Unsuccessful link transfers
  await t
    .click(linkRow)
    .typeText(linkTransferField, `${testEmail}`)
    .click(transferButton)

  // Toasters to disappear after 5sec
  await t.click(clickAway).wait(5000).expect(successSnackBar.exists).notOk()
})

/*
 * Unable to cover the following:
 * It should redirect to the amended url immediately when the long url is changed (any caching for that short url is cleared)
 * It should redirect to the amended file immediately when the file is replaced (any caching for that short url is cleared)
 * It should show an error and not amend the file when a file of size >10mb is selected on replace file
 */
