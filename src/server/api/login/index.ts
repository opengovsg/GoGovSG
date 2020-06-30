import Express from 'express'
import { createValidator } from 'express-joi-validation'
import { otpGenerationSchema, otpVerificationSchema } from './validators'
import { container } from '../../util/inversify'
import { LoginControllerInterface } from '../../controllers/interfaces/LoginControllerInterface'
import { DependencyIds } from '../../constants'

const router: Express.Router = Express.Router()

const authValidator = createValidator({ passError: false, statusCode: 401 })

const loginController = container.get<LoginControllerInterface>(
  DependencyIds.loginController,
)

/**
 * For the Login message banner.
 */
router.get('/message', loginController.getLoginMessage)

router.get('/emaildomains', loginController.getEmailDomains)

/**
 * Request for an OTP to be generated.
 */
router.post(
  '/otp',
  authValidator.body(otpGenerationSchema),
  loginController.generateOtp,
)

/**
 * Verify an OTP submission.
 */
router.post(
  '/verify',
  authValidator.body(otpVerificationSchema),
  loginController.verifyOtp,
)

/**
 * Endpoint to check if a user is logged in via cookies.
 */
router.get('/isLoggedIn', loginController.getIsLoggedIn)

module.exports = router
