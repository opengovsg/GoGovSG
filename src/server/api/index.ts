import Express from 'express'
import jsonMessage from '../util/json.js'
import { DependencyIds, ERROR_404_PATH } from '../constants.js'
import { displayHostname, ffExternalApi } from '../config.js'
import assetVariant from '../../shared/util/asset-variant.js'
import { container } from '../util/inversify.js'
import ApiKeyAuthService from '../modules/user/services/ApiKeyAuthService.js'

import logoutRouter from './logout.js'
import loginRouter from './login/index.js'
import statisticsRouter from './statistics.js'
import linksRouter from './links.js'
import gaRouter from './ga.js'
import userRouter from './user/index.js'
import qrcodeRouter from './qrcode.js'
import linkStatisticsRouter from './link-statistics.js'
import linkAuditRouter from './link-audit.js'
import directoryRouter from './directory.js'
import callbackRouter from './callback.js'
import adminV1Router from './admin-v1/index.js'
import externalV1Router from './external-v1/index.js'

const BEARER_STRING = 'Bearer'
const BEARER_SEPARATOR = ' '
const apiKeyAuthService = container.get<ApiKeyAuthService>(
  DependencyIds.apiKeyAuthService,
)
const router = Express.Router()

/*  Public routes that do not need to be protected */
router.use('/logout', logoutRouter)
router.use('/login', loginRouter)
router.use('/stats', statisticsRouter)
router.use('/links', linksRouter)
router.use('/ga', gaRouter)

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
 * To add guard for admin-user only api routes.
 * */
async function apiKeyAdminAuthMiddleware(
  req: Express.Request,
  res: Express.Response,
  next: Express.NextFunction,
) {
  const { userId } = req.body
  const isAdmin = await apiKeyAuthService.isAdmin(userId)
  if (!isAdmin) {
    res.unauthorized(jsonMessage('User is unauthorized'))
    return
  }
  next()
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
router.use('/user', userGuard, preprocess, userRouter)
router.use('/qrcode', userGuard, qrcodeRouter)
router.use('/link-stats', userGuard, linkStatisticsRouter)
router.use('/link-audit', userGuard, linkAuditRouter)
router.use('/directory', userGuard, directoryRouter)

router.use(
  '/callback',
  apiKeyAuthMiddleware,
  apiKeyAdminAuthMiddleware,
  callbackRouter,
)

/* Register APIKey protected endpoints */
if (ffExternalApi) {
  router.use(
    '/v1/admin',
    apiKeyAuthMiddleware,
    apiKeyAdminAuthMiddleware,
    preprocess,
    adminV1Router,
  )
  router.use('/v1', apiKeyAuthMiddleware, preprocess, externalV1Router)
}

router.use((_, res) => {
  res.status(404).render(ERROR_404_PATH, {
    assetVariant,
    displayHostname,
  })
})

export default router
