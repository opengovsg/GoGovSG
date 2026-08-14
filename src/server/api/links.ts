import Express from 'express'
import { container } from '../util/inversify.js'
import { RotatingLinksController } from '../modules/display/index.js'
import { DependencyIds } from '../constants.js'

const router = Express.Router()

const linksController = container.get<RotatingLinksController>(
  DependencyIds.linksController,
)

/**
 * Requests for the array of links to rotate.
 */
router.get('/', linksController.getRotatingLinks)

export default router
