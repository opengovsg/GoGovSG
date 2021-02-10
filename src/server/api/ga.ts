import Express from 'express'
import { container } from '../util/inversify'
import { GaController } from '../modules/analytics'
import { DependencyIds } from '../constants'

const router = Express.Router()

const gaController = container.get<GaController>(DependencyIds.gaController)

/**
 * Requests for the Google Analytics id.
 */
router.get('/', gaController.getGaId)

module.exports = router
