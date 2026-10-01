import Express from 'express'
import { createValidator } from 'express-joi-validation'
import { ipRateLimiter } from '../../util/request.js'
import { otpGenerationSchema, otpVerificationSchema } from './validators.js'
import { container } from '../../util/inversify.js'
import { LoginController } from '../../modules/auth/index.js'
import { DependencyIds } from '../../constants.js'

const router: Express.Router = Express.Router()

const authValidator = createValidator({ passError: false, statusCode: 401 })

const loginController = container.get<LoginController>(
  DependencyIds.loginController,
)

/**
 * Rate limiter for API generating OTP.
 */
const apiOtpGeneratorLimiter = ipRateLimiter('generating OTP')

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
  apiOtpGeneratorLimiter,
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

export default router
