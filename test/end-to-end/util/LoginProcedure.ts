import { fetch } from 'cross-fetch'
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

  await fetch('http://localhost:1080/email/', {
    method: 'GET',
  })
    .then((res) => {
      if (!res.ok) {
        console.log(res.status)
      }
      return res.json()
    })
    .then((json) => {
      const mailIndex = json.length - 1
      const mailBody = json[mailIndex].html
      const mailOTP = JSON.stringify(mailBody).match(/\d{6}/)[0]
      return mailOTP
    })
    .then(async (mailOTP) => {
      await t.typeText('#otp', mailOTP)
    })

  await t.click(signInButton).click(loginSuccessAlert)

  await fetch('http://localhost:1080/email/all', {
    method: 'DELETE',
  })

  // TODO: is there a better way?
  await t.wait(1000)

  if (await userModal.exists) {
    await t.click(userModalCloseButton)
  }
}

export default loginProcedure
