import { ClientFunction } from 'testcafe'
import { getOtp, getRootLocation, testEmail } from './util/config'
import {
  createLinkButton,
  generateUrlImage,
  loginButton,
  loginSuccessAlert,
  longUrlTextField,
  shortUrlTextField,
  signInButton,
  skipButton,
  userModal,
  userModalCloseButton,
} from './util/helpers'

const location = getRootLocation()
const getLocation = ClientFunction(() => document.location.href)

// eslint-disable-next-line no-undef
fixture(`Transition Page`).page(`${location}`)

test('Transition Page test.', async (t) => {
  // Testcafe always bypass staging transition page, solution not found yet
  /*
   * Drawer should open with the correct long url and state when a short url row is clicked
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
  // create link procedure - generate short url - 1
  await t.click(createLinkButton.nth(0)).click(generateUrlImage)

  // Assign the newly generated shortUrl to a selector to cross-check on the table
  const generatedUrlActive = await shortUrlTextField.value

  // create link procedure - create the link
  await t
    .typeText(shortUrlTextField, '-redirect')
    .typeText(longUrlTextField, 'google.com')

  // if it is the first link to be created, need to click on index 1 button
  if (await createLinkButton.nth(2).exists) {
    await t.click(createLinkButton.nth(2))
  } else {
    await t.click(createLinkButton.nth(1))
  }

  await t.wait(3000)

  // Accessing a short link with a trailing slash should not result in a broken transition page.
  console.log(`${location}/${generatedUrlActive}-redirect/`)
  await t.navigateTo(`${location}/${generatedUrlActive}-redirect/`)

  // Accessing a short link for the first time shows the transition page.
  await t.expect(getLocation()).contains(`${generatedUrlActive}-redirect`)

  // skip button is shown.
  await t.expect(skipButton.getStyleProperty('opacity')).eql('1')

  // After 6 seconds, user is redirected from the transition page to the correct destination long url.
  await t.wait(6000).expect(getLocation()).contains('google.com')

  // Visiting the same short link again does not show the transition page.
  await t
    .navigateTo(`${location}/${generatedUrlActive}-redirect/`)
    .expect(getLocation())
    .contains('google.com')
})
