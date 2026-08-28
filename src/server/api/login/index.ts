import Express from 'express'
import rateLimit from 'express-rate-limit'
import { createValidator } from '../../util/zodValidator.js'
import getIp from '../../util/request.js'
import { otpGenerationSchema, otpVerificationSchema } from './validators.js'
import { container } from '../../util/inversify.js'
import { LoginController } from '../../modules/auth/index.js'
import { DependencyIds } from '../../constants.js'
import { logger, otpRateLimit } from '../../config.js'

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
  // `onLimitReached` was removed in express-rate-limit v6; `handler` would
  // have to also replicate the default 429 response, so the warn log below
  // now happens on every rejected request instead (via `handler`), rather
  // than only on the first one that crosses the limit.
  handler: (req, res, _next, options) => {
    logger.warn(
      `Rate limit (generating OTP) reached for IP Address: ${getIp(req)}`,
    )
    res.status(options.statusCode).send(options.message)
  },
  // `max: 0` disabled rate limiting entirely on v5 and earlier, but v7+
  // flipped that to block every request instead, so `otpRateLimit = 0`
  // (dev/test) must skip the limiter explicitly to keep that behaviour.
  skip: () => otpRateLimit <= 0,
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

export default router
