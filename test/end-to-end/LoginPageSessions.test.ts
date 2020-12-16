import { ClientFunction, Selector } from 'testcafe'
import {
  incorrectEmail,
  incorrectOtp,
  otp,
  rootLocation,
  testEmail,
} from './util/config'
import { emailHelperText, loginButton, signInButton } from './util/helpers'

const getLocation = ClientFunction(() => document.location.href)

// eslint-disable-next-line no-undef
fixture(`Login Page`).page(`${rootLocation}`)

test('Invalid Email that does not end with .gov.sg and should not allow submission', async (t) => {
  await t
    .click(loginButton)
    .typeText('#email', `${incorrectEmail}`)
    // It should respond with invalid email when email does not end with .gov.sg
    .expect(emailHelperText.innerText)
    .eql("This doesn't look like a valid gov.sg email.")
    // It should not allow submission when email is invalid
    .expect(signInButton.hasAttribute('disabled'))
    .ok()
})

test('Invalid OTP should not log the user in', async (t) => {
  await t
    .click(loginButton)
    .typeText('#email', `${testEmail}`)
    .click(signInButton)
    .typeText('#otp', `${incorrectOtp}`)
    .click(signInButton)
    // Invalid OTP should not log the user in
    .expect(Selector('div[role="alert"]').exists)
    .ok()
})

test('After trying to enter wrong OTP 3 times, it should respond with OTP not found/expired (a new OTP must be requested)', async (t) => {
  await t
    .click(loginButton)
    .typeText('#email', `${testEmail}`)
    .click(signInButton)
    .typeText('#otp', `${incorrectOtp}`)
    .click(signInButton)
    .click(signInButton)
    .click(signInButton)
    .click(signInButton)
    // After trying to enter wrong OTP 3 times, it should respond with OTP not found/expired (a new OTP must be requested)
    .expect(Selector('div[role="alert"]').child(0).innerText)
    .eql('OTP expired/not found.')
})

test.page(`${rootLocation}/#/user`)(
  'Visiting/user should redirect to login page when not logged in',
  async (t) => {
    // Visiting /user should redirect to login page when not logged in
    await t.expect(getLocation()).match(/login/)
  },
)

test('Valid OTP should log the user in', async (t) => {
  // Shows the homepage if user does not have an existing session
  await t
    .click(loginButton)
    .typeText('#email', `${testEmail}`)
    .click(signInButton)
    .typeText('#otp', otp)
    .click(signInButton)
    // Valid OTP should log the user in
    .expect(getLocation())
    .match(/user/)

  // Redirects to /user if user has an existing session (ie logged in previously on the same browser)
  await t.navigateTo(`${rootLocation}`).expect(getLocation()).match(/user/)
})
