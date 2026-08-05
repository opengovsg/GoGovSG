import { testEmail } from './config'
import {
  clearMaildevInbox,
  getMaildevMessageIds,
  waitForOtpFromMaildev,
} from '../../shared/maildev'
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
  await t.click(loginButton).typeText('#email', `${loginEmail}`)

  const afterMessageIds = await getMaildevMessageIds()
  await t.click(signInButton)

  const mailOTP = await waitForOtpFromMaildev({
    to: loginEmail,
    afterMessageIds,
  })
  await t.typeText('#otp', mailOTP)

  await t.click(signInButton).click(loginSuccessAlert)

  await clearMaildevInbox()

  if (await userModal.exists) {
    await t.click(userModalCloseButton)
  }
}

export default loginProcedure
