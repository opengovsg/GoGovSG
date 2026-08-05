import {
  clearMaildevInbox,
  waitForOtpFromMaildev,
} from '../../shared/maildev'
import { testEmail } from './config'
import {
  loginButton,
  loginSuccessAlert,
  signInButton,
  userModal,
  userModalCloseButton,
} from './helpers'

/**
 * Process of login into test account.
 */
const loginProcedure = async (t, loginEmail = testEmail) => {
  await t.maximizeWindow()
  await t
    .click(loginButton)
    .typeText('#email', `${loginEmail}`)
    .click(signInButton)

  const mailOTP = await waitForOtpFromMaildev()
  await t.typeText('#otp', mailOTP)

  await t.click(signInButton).click(loginSuccessAlert)

  await clearMaildevInbox()

  if (await userModal.exists) {
    await t.click(userModalCloseButton)
  }
}

export default loginProcedure
