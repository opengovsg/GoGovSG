import Express from 'express'
import {
  generateOtp,
  getEmailDomains,
  getIsLoggedIn,
  getLoginMessage,
  verifyOtp,
} from './handlers'

const router: Express.Router = Express.Router()

/**
 * For the Login message banner.
 */
router.get('/message', getLoginMessage)

router.get('/emaildomains', getEmailDomains)

/**
 * Request for an OTP to be generated.
 */
router.post('/otp', generateOtp)

/**
 * Verify an OTP submission.
 */
router.post('/verify', verifyOtp)

/**
 * Endpoint to check if a user is logged in via cookies.
 */
router.get('/isLoggedIn', getIsLoggedIn)

module.exports = router
