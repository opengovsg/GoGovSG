import { ClientFunction, Selector } from 'testcafe'
import {
  getEmailIp,
  getMyIp,
  getOtp,
  getRootLocation,
  testEmail,
} from './util/config'

const location = getRootLocation()
const getLocation = ClientFunction(() => document.location.href)

// eslint-disable-next-line no-undef
fixture(`Login Page`).page(`${location}`)

test('Invalid Email that does not end with .gov.sg and should not allow submission', async (t) => {
  /*
   * It should respond with invalid email when email does not end with .gov.sg
   * It should not allow submission when email is invalid
   */

  const loginButton = Selector('span').withText('Sign in')
  const signInButton = Selector('button[type="submit"]')
  const emailHelperText = Selector('#email-helper-text')

  await t
    .click(loginButton)
    .typeText('#email', `testcafe@hotmail.com`)
    .expect(emailHelperText.innerText)
    .eql("This doesn't look like a valid gov.sg email.")
    .expect(signInButton.nth(0).hasAttribute('disabled'))
    .ok()
})

test('Invalid OTP should not log the user in', async (t) => {
  /*
   * Invalid OTP should not log the user in
   */

  const loginButton = Selector('span').withText('Sign in')
  // there are 2 sign in buttons at the same time!
  const signInButton = Selector('button[type="submit"]')

  await t
    .click(loginButton)
    .typeText('#email', `${testEmail}`)
    .click(signInButton.nth(0))
    .typeText('#otp', '222222')
    .click(signInButton.nth(1))
    .expect(Selector('div[role="alert"]').exists)
    .ok()
})

test('After trying to enter wrong OTP 3 times, it should respond with OTP not found/expired (a new OTP must be requested)', async (t) => {
  /*
   * After trying to enter wrong OTP 3 times, it should respond with OTP not found/expired (a new OTP must be requested)
   */

  const loginButton = Selector('span').withText('Sign in')
  // there are 2 sign in buttons at the same time!
  const signInButton = Selector('button[type="submit"]')

  await t
    .click(loginButton)
    .typeText('#email', `${testEmail}`)
    .click(signInButton.nth(0))
    .typeText('#otp', '222222')
    .click(signInButton.nth(1))
    .click(signInButton.nth(1))
    .click(signInButton.nth(1))
    .click(signInButton.nth(1))
    .expect(Selector('div[role="alert"]').child(0).innerText)
    .eql('OTP expired/not found.')
})

test.page(`${location}/#/user`)(
  'Visiting/user should redirect to login page when not logged in',
  async (t) => {
    /*
     * Visiting /user should redirect to login page when not logged in
     */

    const currLocation = ClientFunction(() => document.location.href)

    await t.expect(currLocation()).match(/login/)
  },
)

test('Valid OTP should log the user in', async (t) => {
  /*
   * Valid OTP should log the user in
   * Shows the homepage if user does not have an existing session
   * Redirects to /user if user has an existing session (ie logged in previously on the same browser)
   */

  const loginButton = Selector('span').withText('Sign in')
  const signInButton = Selector('button[type="submit"]')

  await t
    // Login Procedure
    .click(loginButton)
    .typeText('#email', `${testEmail}`)
    .click(signInButton.nth(0))

  const otp = await getOtp()

  await t
    .typeText('#otp', otp)
    .click(signInButton.nth(1))
    .expect(getLocation())
    .match(/user/)

  await t.navigateTo(`${location}`).expect(getLocation()).match(/user/)
})

test('Resent OTP should log the user in', async (t) => {
  /*
   * OTP email should contain requestor's IP address
   * Resend OTP should send a new OTP to user, and invalidate previous OTP
   */

  const loginButton = Selector('span').withText('Sign in')
  const signInButton = Selector('button[type="submit"]')
  const resendOtpButton = Selector('span').withText('Resend OTP').parent()

  await t
    // Login Procedure
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
