import Express from 'express'
import rateLimit from 'express-rate-limit'
import { createValidator } from 'express-joi-validation'
import getIp from '../../util/request'
import { otpGenerationSchema, otpVerificationSchema } from './validators'
import { container } from '../../util/inversify'
import { LoginController } from '../../modules/auth'
import { DependencyIds } from '../../constants'
import { logger, otpRateLimit } from '../../config'

const router: Express.Router = Express.Router()

const authValidator = createValidator({ passError: false, statusCode: 401 })

const loginController = container.get<LoginController>(
  DependencyIds.loginController,
)

/**
 * Rate limiter for API generating OTP.
 */
const apiOtpGeneratorLimiter = rateLimit({
  keyGenerator: (req) => getIp(req) as string,
  onLimitReached: (req) =>
    logger.warn(
      `Rate limit (generating OTP) reached for IP Address: ${getIp(req)}`,
    ),
  windowMs: 60000, // 1 minute
  max: otpRateLimit,
})

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

module.exports = router
