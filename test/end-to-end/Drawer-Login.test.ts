/* eslint-disable import/no-extraneous-dependencies */
import { Selector } from 'testcafe'
import {
  otp,
  rootLocation,
  shortUrl,
  subUrl,
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
import firstLinkHandle from './util/First-Link-Handle'

// eslint-disable-next-line no-undef
fixture(`Drawer Page`)
  .page(`${rootLocation}`)
  .beforeEach(async (t) => {
    await LoginProcedure(t)
  })

test('Drawer functionality test.', async (t) => {
  await t.click(createLinkButton.nth(0)).click(generateUrlImage)

  const generatedUrl = await shortUrlTextField.value
  const linkRow = Selector(`h6[title="${generatedUrl}"]`)

  await t.typeText(longUrlTextField, `${shortUrl}`)

  await firstLinkHandle(t)

  await t
    .click(linkRow)
    .expect(drawer.exists)
    .ok()
    // Drawer should open with the correct long url and state when a short url row is clicked
    .expect(longUrl.value)
    .eql(`${shortUrl}`)

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
    // Url reverts to original when user enters a new url, then re-opens the drawer without clicking "save"
    .expect(longUrl.value)
    .eql('google.com')

  await t
    .click(longUrl)
    .pressKey('ctrl+a delete')
    .typeText(longUrl, `${subUrl}`)
    .click(urlSaveButton)
    // It should show a success snackbar when long url is changed
    .expect(urlUpdatedToaster.exists)
    .ok()

  await t
    .click(drawer.child(2).child('main').child('button'))
    .click(linkRow)
    // Url is updated/saved when user enters a new url, then clicks "save"
    .expect(longUrl.value)
    .eql(`${subUrl}`)

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
    .click(signInButton)
    .typeText('#otp', otp)
    .click(signInButton)

  if (await userModal.exists) {
    await t.click(userModalCloseButton)
  }

  await t.click(signOutButton).navigateTo(`${rootLocation}`)

  await LoginProcedure(t)
})('Link transfer test.', async (t) => {
  await t.click(createLinkButton.nth(0)).click(generateUrlImage)

  const generatedUrl = await shortUrlTextField.value
  const linkRow = Selector(`h6[title="${generatedUrl}"]`)

  await t
    .typeText(longUrlTextField, `${shortUrl}`)
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
    // It should show a success snackbar when link is transferred to another user.
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

test('Link transfer toast test.', async (t) => {
  await t.click(createLinkButton.nth(0)).click(generateUrlImage)

  const generatedUrl = await shortUrlTextField.value
  const linkRow = Selector(`h6[title="${generatedUrl}"]`)

  await t
    .typeText(longUrlTextField, `${shortUrl}`)
    .click(createLinkButton.nth(2))

  await t
    .click(linkRow)
    .typeText(linkTransferField, `${testEmail}`)
    .click(transferButton)

  // Toasters to disappear after 5sec
  await t.click(clickAway).wait(5000).expect(successSnackBar.exists).notOk()
})
