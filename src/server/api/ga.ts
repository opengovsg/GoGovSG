import Express from 'express'
import { container } from '../util/inversify.js'
import { GaController } from '../modules/analytics/index.js'
import { DependencyIds } from '../constants.js'

const router = Express.Router()

const gaController = container.get<GaController>(DependencyIds.gaController)

/**
 * Requests for the Google Analytics id.
 */
router.get('/', gaController.getGaId)

export default router
