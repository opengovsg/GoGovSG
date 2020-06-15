import Express from 'express'
import { container } from '../util/inversify'
import { SentryControllerInterface } from '../controllers/interfaces/SentryControllerInterface'
import { DependencyIds } from '../constants'

const router = Express.Router()

const sentryController = container.get<SentryControllerInterface>(
  DependencyIds.sentryController,
)

/**
 * Requests for the Sentry DNS.
 */
router.get('/', sentryController.getSentryDns)

module.exports = router
