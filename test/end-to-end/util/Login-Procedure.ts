import { getOtp, testEmail } from './config'
import {
  loginButton,
  loginSuccessAlert,
  signInButton,
  userModal,
  userModalCloseButton,
} from './helpers'

const loginProcedure = async (t) => {
  await t
    .click(loginButton)
    .typeText('#email', `${testEmail}`)
    .click(signInButton.nth(0))

  const otp = await getOtp()

  await t
    .typeText('#otp', otp)
    .click(signInButton.nth(1))
    .click(loginSuccessAlert)

  if (await userModal.exists) {
    await t.click(userModalCloseButton)
  }
}

export default loginProcedure
