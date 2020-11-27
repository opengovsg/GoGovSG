import { ClientFunction, Selector } from 'testcafe'
import {
  getEmailIp,
  getMyIp,
  getOtp,
  getRootLocation,
  testEmail,
} from './util/config'
import {
  emailHelperText,
  loginButton,
  resendOtpButton,
  signInButton,
} from './util/helpers'

const location = getRootLocation()
const getLocation = ClientFunction(() => document.location.href)

// eslint-disable-next-line no-undef
fixture(`Login Page`).page(`${location}`)

test('Invalid Email that does not end with .gov.sg and should not allow submission', async (t) => {
  await t
    .click(loginButton)
    .typeText('#email', `testcafe@hotmail.com`)
    // It should respond with invalid email when email does not end with .gov.sg
    .expect(emailHelperText.innerText)
    .eql("This doesn't look like a valid gov.sg email.")
    // It should not allow submission when email is invalid
    .expect(signInButton.nth(0).hasAttribute('disabled'))
    .ok()
})

test('Invalid OTP should not log the user in', async (t) => {
  await t
    .click(loginButton)
    .typeText('#email', `${testEmail}`)
    .click(signInButton.nth(0))
    .typeText('#otp', '222222')
    .click(signInButton.nth(1))
    // Invalid OTP should not log the user in
    .expect(Selector('div[role="alert"]').exists)
    .ok()
})

test('After trying to enter wrong OTP 3 times, it should respond with OTP not found/expired (a new OTP must be requested)', async (t) => {
  await t
    .click(loginButton)
    .typeText('#email', `${testEmail}`)
    .click(signInButton.nth(0))
    .typeText('#otp', '222222')
    .click(signInButton.nth(1))
    .click(signInButton.nth(1))
    .click(signInButton.nth(1))
    .click(signInButton.nth(1))
    // After trying to enter wrong OTP 3 times, it should respond with OTP not found/expired (a new OTP must be requested)
    .expect(Selector('div[role="alert"]').child(0).innerText)
    .eql('OTP expired/not found.')
})

test.page(`${location}/#/user`)(
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
    .click(signInButton.nth(0))

  const otp = await getOtp()

  await t
    .typeText('#otp', otp)
    .click(signInButton.nth(1))
    // Valid OTP should log the user in
    .expect(getLocation())
    .match(/user/)

  // // Redirects to /user if user has an existing session (ie logged in previously on the same browser)
  await t.navigateTo(`${location}`).expect(getLocation()).match(/user/)
})

test('Resent OTP should log the user in', async (t) => {
  await t
    .click(loginButton)
    .typeText('#email', `${testEmail}`)
    .click(signInButton.nth(0))

  const prevOtp = await getOtp()

  // Resend OTP should send a new OTP to user, and invalidate previous OTP
  await t
    .typeText('#otp', '222222')
    .click(signInButton.nth(1))
    .click(resendOtpButton)
    .click('#otp')
    .pressKey('ctrl+a delete')
    .typeText('#otp', prevOtp)
    .click(signInButton.nth(1))
    .expect(Selector('div[role="alert"]').exists)
    .ok()

  // OTP email should contain requestor's IP address
  const myIp = await getMyIp()
  const emailIp = await getEmailIp()

  await t.expect(emailIp).eql(myIp)
})

/*
 * Unable to test the following
 * Resend OTP should send a new OTP to user, and invalidate previous OTP
 */
