import Express from 'express'
import { ipRateLimiter } from '../../util/request.js'
import { container } from '../../util/inversify.js'
import { OneGovSgController } from '../../modules/auth/index.js'
import { DependencyIds } from '../../constants.js'
import { ffOneGovSgLogin } from '../../config.js'

const router: Express.Router = Express.Router()

const oneGovSgController = container.get<OneGovSgController>(
  DependencyIds.oneGovSgController,
)

/**
 * Tells the frontend whether to show the one.gov.sg login button.
 */
router.get('/enabled', (_req, res) => {
  res.ok({ enabled: ffOneGovSgLogin })
})

if (ffOneGovSgLogin) {
  /**
   * Starts a one.gov.sg login (rate limited, guide step 2). Also registered
   * as the initiate_login_uri.
   */
  router.get(
    '/login',
    ipRateLimiter('one.gov.sg login'),
    oneGovSgController.login,
  )

  /**
   * One.gov.sg redirects here after authentication.
   */
  router.get('/callback', oneGovSgController.callback)
}

export default router
