import Express from 'express'
import { container } from '../util/inversify'
import { RotatingLinksController } from '../modules/display'
import { DependencyIds } from '../constants'

const router = Express.Router()

const linksController = container.get<RotatingLinksController>(
  DependencyIds.linksController,
)

/**
 * Requests for the array of links to rotate.
 */
router.get('/', linksController.getRotatingLinks)

module.exports = router
