import { otp, testEmail } from './config'
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
    .click(signInButton)
    .typeText('#otp', otp)
    .click(signInButton)
    .click(loginSuccessAlert)

  if (await userModal.exists) {
    await t.click(userModalCloseButton)
  }
}

export default loginProcedure
