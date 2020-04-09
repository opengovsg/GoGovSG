import Express from 'express'
import { sentryDns } from '../config'

const router = Express.Router()

/**
 * Requests for the Sentry DNS.
 */
router.get('/', (_, res) => res.send(sentryDns))

module.exports = router
