import Express from 'express'
import jsonMessage from '../util/json'

const router = Express.Router()

/*  Public routes that do not need to be protected */
router.use('/logout', require('./logout'))
router.use('/login', require('./login'))
router.use('/stats', require('./statistics'))
router.use('/sentry', require('./sentry'))
router.use('/links', require('./links'))

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
  if (req.body.email) {
    req.body.email = req.body.email.trim().toLowerCase()
  }

  next()
}

/* Register protected endpoints */
router.use('/user', userGuard, preprocess, require('./user'))
router.use('/qrcode', userGuard, require('./qrcode'))
router.use('/link-stats', userGuard, require('./link-statistics'))

export default router
