import Express from 'express'
import bcrypt from 'bcrypt'
import validator from 'validator'
import jsonMessage from '../util/json'
import { User } from '../models/user'
import { otpClient } from '../redis'
import { mailOTP } from '../util/email'
import {
  emailValidator,
  getOTP,
  logger,
  loginMessage,
  otpExpiry,
  saltRounds,
  validEmailDomainGlobExpression,
} from '../config'

const router: Express.Router = Express.Router()

/**
 * Checks if an email is valid and whether it follows a specified regex pattern.
 * @param email The email to be validated.
 */
function isValidGovEmail(email: string) {
  return validator.isEmail(email) && emailValidator.match(email)
}
/**
 * For the Login message banner.
 */
router.get('/message', (_, res: Express.Response) => res.send(loginMessage))

router.get('/emaildomains', (_, res: Express.Response) => res.send(validEmailDomainGlobExpression))

/**
 * Request for an OTP to be generated.
 */
router.post('/otp', (req: Express.Request, res: Express.Response) => {
  const { email } = req.body
  if (isValidGovEmail(email)) {
    // Generate otp
    const otp = getOTP()

    // Hash with bcrypt
    bcrypt.hash(otp, saltRounds, (error, hashedOtp) => {
      if (error) {
        logger.error(`OTP generation failed unexpectedly:\t${error}`)
        res.serverError(jsonMessage('OTP generation failed unexpectedly.'))
        return
      }

      // Store the hash in a temp table that expires in 5 minutes
      const otpObject = {
        hashedOtp,
        retries: 3,
      }

      otpClient.set(
        email,
        JSON.stringify(otpObject),
        'EX',
        otpExpiry,
        (redisSetError) => {
          if (redisSetError) {
            res.serverError(jsonMessage('Could not save OTP hash.'))
            logger.error(`Could not save OTP hash:\t${redisSetError}`)
            return
          }

          // Email out the otp (nodemailer)
          mailOTP(email, otp, (mailError: Error) => {
            if (!mailError) {
              res.ok(jsonMessage('OTP generated and sent.'))
            } else if (process.env.NODE_ENV === 'development') {
              logger.warn('Allowing user to OTP even though mail errored.')
              logger.warn(
                'This may be an issue with your IP. More information can be found at https://support.google.com/mail/answer/10336?hl=en)',
              )
              logger.warn('This message should NEVER be seen in production.')
              res.ok(jsonMessage('Error mailing OTP.'))
            } else {
              res.serverError(
                jsonMessage('Error mailing OTP, please try again later.'),
              )
            }
          })
        },
      )
    })
  } else {
    res.badRequest(
      jsonMessage('Invalid email provided. Email domain is not whitelisted.'),
    )
  }
})

/**
 * Verify an OTP submission.
 */
router.post('/verify', (req, res) => {
  const { email, otp } = req.body

  if (isValidGovEmail(email) && otp) {
    // Retrieve hash from cache
    otpClient.get(email, (redisGetError, otpString: string) => {
      if (redisGetError) {
        logger.error(`Error retrieving OTP:\t${redisGetError}`)
        res.serverError(
          jsonMessage('Error retrieving OTP. Please try again later.'),
        )
        return
      }

      if (!otpString) {
        res.unauthorized(jsonMessage('OTP expired/not found.'))
        return
      }

      // Compare plaintext OTP with hashed OTP
      const otpObject = JSON.parse(otpString)

      bcrypt
        .compare(otp, otpObject.hashedOtp)
        .then((compareResponse) => {
          // Hash check failed, do not log user in
          if (!compareResponse) {
            otpObject.retries -= 1

            res.unauthorized(
              jsonMessage(
                `OTP hash verification failed, ${otpObject.retries} attempt(s) remaining.`,
              ),
            )

            if (otpObject.retries > 0) {
              otpClient.set(
                email,
                JSON.stringify(otpObject),
                'EX',
                otpExpiry,
                (otpRetryDecrementError) => {
                  if (otpRetryDecrementError) {
                    logger.error(
                      `OTP retry could not be decremented:\t${otpRetryDecrementError}`,
                    )
                  }
                },
              )
            } else {
              otpClient.del(email, (otpRetryLimitError) => {
                if (otpRetryLimitError) {
                  logger.error(
                    `Could not delete OTP after reaching retry limit:\t${otpRetryLimitError}`,
                  )
                }
              })
            }
          } else {
            // OTP check passed!
            User.findOrCreate({ where: { email } })
              .then(([user, _]) => {
                // Successful login

                // Expire the OTP
                otpClient.del(email, (redisDelError, resdisDelResponse) => {
                  if (redisDelError || resdisDelResponse !== 1) {
                    logger.error(`OTP could not be expired:\t${redisDelError}`)
                  }
                })

                // Append user to current session
                req.session!.user = user.get()
                res.ok(jsonMessage('OTP hash verification ok.'))
              })
              .catch((error: Error) => {
                res.serverError(jsonMessage('Error creating user.'))
                logger.error(`Error creating user:\t ${email}, ${error}`)
              })
          }
        })
        .catch((error: Error) => {
          res.serverError(
            jsonMessage('Error verifying OTP. Please try again later.'),
          )
          logger.error(`Error verifying OTP:\t${error}`)
        })
    })
  } else {
    res.badRequest(
      jsonMessage('Some or all of required arguments are missing: email, otp'),
    )
  }
})

/**
 * Endpoint to check if a user is logged in via cookies.
 */
router.get('/isLoggedIn', (req, res) => {
  const { session } = req
  const { user } = session!
  if (user) {
    const response = { ...jsonMessage('Logged in'), user }
    res.ok(response)
  } else {
    res.notFound(jsonMessage('User session not found'))
  }
})

module.exports = router
