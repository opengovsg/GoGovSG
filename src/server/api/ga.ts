import Express from 'express'
import { container } from '../util/inversify'
import { GaControllerInterface } from '../controllers/interfaces/GaControllerInterface'
import { DependencyIds } from '../constants'

const router = Express.Router()

const gaController = container.get<GaControllerInterface>(
  DependencyIds.gaController,
)

/**
 * Requests for the Google Analytics id.
 */
router.get('/', gaController.getGaId)

module.exports = router
