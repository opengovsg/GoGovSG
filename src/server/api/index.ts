import Express from 'express'
import jsonMessage from '../util/json'
import { DependencyIds, ERROR_404_PATH } from '../constants'
import { displayHostname, ffExternalApi } from '../config'
import assetVariant from '../../shared/util/asset-variant'
import { container } from '../util/inversify'
import ApiKeyAuthService from '../modules/user/services/ApiKeyAuthService'

import logoutRouter from './logout'
import loginRouter from './login'
import statisticsRouter from './statistics'
import linksRouter from './links'
import gaRouter from './ga'
import userRouter from './user'
import qrcodeRouter from './qrcode'
import linkStatisticsRouter from './link-statistics'
import linkAuditRouter from './link-audit'
import directoryRouter from './directory'
import callbackRouter from './callback'
import adminV1Router from './admin-v1'
import externalV1Router from './external-v1'

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
