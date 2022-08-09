import Express from 'express'
import jsonMessage from '../util/json'
import { ERROR_404_PATH } from '../constants'
import { displayHostname } from '../config'
import assetVariant from '../../shared/util/asset-variant'

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

router.use((_, res) => {
  res.status(404).render(ERROR_404_PATH, {
    assetVariant,
    displayHostname,
  })
})

export default router
