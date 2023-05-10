import Express from 'express'
import { MessageType } from '../../shared/util/messages'
import jsonMessage from '../util/json'
import { DependencyIds, ERROR_404_PATH } from '../constants'
import { displayHostname, ffExternalApi } from '../config'
import assetVariant from '../../shared/util/asset-variant'
import { container } from '../util/inversify'
import ApiKeyAuthService from '../modules/user/services/ApiKeyAuthService'

const BEARER_STRING = 'Bearer'
const BEARER_SEPARATOR = ' '
const apiKeyAuthService = container.get<ApiKeyAuthService>(
  DependencyIds.apiKeyAuthService,
)
const router = Express.Router()

/**
 * To add guard for admin-user only api routes.
 * */
async function apiKeyAdminAuthMiddleware(
  req: Express.Request,
  res: Express.Response,
  next: Express.NextFunction,
) {
  const authorizationHeader = req.headers.authorization
  if (!authorizationHeader) {
    res.unauthorized(jsonMessage('Authorization header is missing'))
    return
  }

  const [bearerString, apiKey] = authorizationHeader.split(BEARER_SEPARATOR)
  if (bearerString !== BEARER_STRING) {
    res.unauthorized(jsonMessage('Invalid authorization header format'))
    return
  }
  try {
    const user = await apiKeyAuthService.getUserByApiKey(apiKey)
    if (!user) {
      res.unauthorized(jsonMessage('Invalid API Key'))
      return
    }
    if (!(await apiKeyAuthService.isAdmin(user.id))) {
      res.unauthorized(
        jsonMessage(
          `Email ${user.email} is not white listed`,
          MessageType.ShortUrlError,
        ),
      )
      return
    }
    req.body.userId = user.id
    next()
  } catch {
    res.unauthorized(jsonMessage('Invalid API Key'))
    return
  }
}

/**
 *  Preprocess request parameters.
 * */
function preprocess(
  req: Express.Request,
  _: Express.Response,
  next: Express.NextFunction,
) {
  if (req.body.email && typeof req.body.email === 'string') {
    req.body.email = req.body.email.trim().toLowerCase()
  }

  next()
}

/* Register APIKey protected endpoints */
if (ffExternalApi) {
  router.use(
    '/v1',
    apiKeyAdminAuthMiddleware,
    preprocess,
    // eslint-disable-next-line global-require
    require('./admin-v1'),
  )
}

router.use((_, res) => {
  res.status(404).render(ERROR_404_PATH, {
    assetVariant,
    displayHostname,
  })
})

export default router
