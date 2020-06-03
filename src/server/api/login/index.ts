import Express from 'express'
import { createValidator } from 'express-joi-validation'
import {
  generateOtp,
  getEmailDomains,
  getIsLoggedIn,
  getLoginMessage,
  verifyOtp,
} from './handlers'
import { otpGenerationSchema, otpVerificationSchema } from './validators'

const router: Express.Router = Express.Router()

<<<<<<< HEAD
const validator = createValidator()
=======
const validator = createValidator({ passError: true })
>>>>>>> 482e9e2... Implement frontend for file upload and patch endpoint

/**
 * For the Login message banner.
 */
router.get('/message', getLoginMessage)

router.get('/emaildomains', getEmailDomains)

/**
 * Request for an OTP to be generated.
 */
router.post('/otp', validator.body(otpGenerationSchema), generateOtp)

/**
 * Verify an OTP submission.
 */
router.post('/verify', validator.body(otpVerificationSchema), verifyOtp)

/**
 * Endpoint to check if a user is logged in via cookies.
 */
router.get('/isLoggedIn', getIsLoggedIn)

module.exports = router
