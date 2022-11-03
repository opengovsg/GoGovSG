import Express from 'express'
import jsonMessage from '../util/json'
import { DependencyIds, ERROR_404_PATH } from '../constants'
import { displayHostname } from '../config'
import assetVariant from '../../shared/util/asset-variant'
import { container } from '../util/inversify'
import ApiKeyAuthService from '../modules/user/services/ApiKeyAuthService'

const BEARER_STRING = 'Bearer'
const BEARER_SEPARATOR = ' '
const apiKeyAuthService = container.get<ApiKeyAuthService>(
  DependencyIds.apiKeyAuthService,
)
const router = Express.Router()

/*  Public routes that do not need to be protected */
router.use('/logout', require('./logout'))
router.use('/login', require('./login'))
router.use('/stats', require('./statistics'))
router.use('/sentry', require('./sentry'))
router.use('/links', require('./links'))
router.use('/ga', require('./ga'))

/**
 * To protect private user routes.
 * */
function userGuard(
  req: Express.Request,
  res: Express.Response,
  next: Express.NextFunction,
) {
  if (!req.session || !req.session.user || !req.session.user.id) {
    res.unauthorized(jsonMessage('Unauthorized'))
    return
  }
  req.body.userId = req.session.user.id
  next()
}

/**
 * To protect external-v1 APIs by APIKey.
 * */
async function apiKeyAuthMiddleware(
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

/* Register protected endpoints */
router.use('/user', userGuard, preprocess, require('./user'))
router.use('/qrcode', userGuard, require('./qrcode'))
router.use('/link-stats', userGuard, require('./link-statistics'))
router.use('/link-audit', userGuard, require('./link-audit'))
router.use('/directory', userGuard, require('./directory'))

/* Register APIKey protected endpoints */
router.use('/v1', apiKeyAuthMiddleware, preprocess, require('./external-v1'))

router.use((_, res) => {
  res.status(404).render(ERROR_404_PATH, {
    assetVariant,
    displayHostname,
  })
})

export default router
