import Express from 'express'
import { container } from '../util/inversify'
import { SentryController } from '../modules/sentry'
import { DependencyIds } from '../constants'

const router = Express.Router()

const sentryController = container.get<SentryController>(
  DependencyIds.sentryController,
)

/**
 * Requests for the Sentry DNS.
 */
router.get('/', sentryController.getSentryDns)

module.exports = router
