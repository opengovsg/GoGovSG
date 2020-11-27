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
import LoginProcedure from './util/Login-Procedure'

const location = getRootLocation()

// eslint-disable-next-line no-undef
fixture(`Drawer Page`)
  .page(`${location}`)
  .beforeEach(async (t) => {
    await LoginProcedure(t)
  })

test('The Drawer functionality test.', async (t) => {
  await t.click(createLinkButton.nth(0)).click(generateUrlImage)

  const generatedUrl = await shortUrlTextField.value
  const linkRow = Selector(`h6[title="${generatedUrl}"]`)

  await t.typeText(longUrlTextField, 'google.com')

  if (await createLinkButton.nth(2).exists) {
    await t.click(createLinkButton.nth(2))
  } else {
    await t.click(createLinkButton.nth(1))
  }

  await t
    .click(linkRow)
    .expect(drawer.exists)
    .ok()
    // Drawer should open with the correct long url and state when a short url row is clicked
    .expect(longUrl.value)
    .eql('google.com')

  await t
    .click(drawer.child(2).child('main').child('button'))
    // Drawer can be closed on clickaway or when the close button is clicked.
    .expect(drawer.exists)
    .notOk()

  await t
    .click(linkRow)
    .click(activeSwitch.nth(0))
    // It should set short url active or inactive immediately when the toggle is switched (any caching for that short url is cleared)
    .expect(inactiveWord.exists)
    .ok()

  await t
    .click(longUrl)
    .pressKey('ctrl+a delete')
    .typeText(longUrl, 'yahoo.com')
    .click(drawer.child(2).child('main').child('button'))
    .click(linkRow)
    // Url is reverts to original when user enters a new url, then re-opens the drawer without clicking "save"
    .expect(longUrl.value)
    .eql('google.com')

  await t
    .click(longUrl)
    .pressKey('ctrl+a delete')
    .typeText(longUrl, 'yahoo.com')
    .click(urlSaveButton)
    // It should show a success snackbar when long url is changed
    .expect(urlUpdatedToaster.exists)
    .ok()

  await t
    .click(drawer.child(2).child('main').child('button'))
    .click(linkRow)
    // Url is updated/saved when user enters a new url, then clicks "save"
    .expect(longUrl.value)
    .eql('yahoo.com')

  await t
    .click(longUrl)
    .pressKey('ctrl+a delete')
    .typeText(longUrl, 'invalid')
    // Error validation (red underline + helperText) appears when value in edit long url textfield is invalid
    .expect(helperText.exists)
    .ok()

  // "Save" button is disabled (grey and unclickable) when value in edit long url textfield is invalid
  await t.expect(urlSaveButton.parent(0).hasAttribute('disabled')).ok()
})

test.before(async (t) => {
  // login to the transfer email to activate it, then logout
  await t
    .click(loginButton)
    .typeText('#email', `${transferEmail}`)
    .click(signInButton.nth(0))

  const otp = await getOtp()

  await t.typeText('#otp', otp).click(signInButton.nth(1))

  if (await userModal.exists) {
    await t.click(userModalCloseButton)
  }

  await t.click(signOutButton).navigateTo(`${location}`)

  await LoginProcedure(t)
})('The link transfer test - 1.', async (t) => {
  await t.click(createLinkButton.nth(0)).click(generateUrlImage)

  const generatedUrl = await shortUrlTextField.value
  const linkRow = Selector(`h6[title="${generatedUrl}"]`)

  await t
    .typeText(longUrlTextField, 'google.com')
    .click(createLinkButton.nth(2))

  await t
    .click(linkRow)
    .typeText(linkTransferField, `${testEmail}`)
    .click(transferButton)
    .click(linkErrorSnackBar)
    // Unsuccessful link transfers do not close the drawer.
    .expect(drawer.exists)
    .ok()

  await t
    .click(linkTransferField)
    .pressKey('ctrl+a delete')
    .typeText(linkTransferField, `${transferEmail}`)
    .click(transferButton)
    // Successful link transfers closes the drawer.
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
  await t.click(createLinkButton.nth(0)).click(generateUrlImage)

  const generatedUrl = await shortUrlTextField.value
  const linkRow = Selector(`h6[title="${generatedUrl}"]`)

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
