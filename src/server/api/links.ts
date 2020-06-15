import Express from 'express'
import { container } from '../util/inversify'
import { RotatingLinksControllerInterface } from '../controllers/interfaces/RotatingLinksControllerInterface'
import { DependencyIds } from '../constants'

const router = Express.Router()

const linksController = container.get<RotatingLinksControllerInterface>(
  DependencyIds.linksController,
)

/**
 * Requests for the array of links to rotate.
 */
router.get('/', linksController.getRotatingLinks)

module.exports = router
