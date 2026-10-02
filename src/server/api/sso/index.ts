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
   * Starts a one.gov.sg login (rate limited, guide step 2). The registered
   * initiate_login_uri is the frontend `/#/login`, which forwards `iss` here
   * from the local browser (see src/client/login/sso.ts).
   */
  router.get('/login', ipRateLimiter('oneGovSgLogin'), oneGovSgController.login)

  /**
   * The frontend redirect_uri page (/) forwards one.gov.sg's response here
   * (see src/client/login/sso.ts).
   */
  router.get('/callback', oneGovSgController.callback)
}

export default router
