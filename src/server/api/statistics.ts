import Express from 'express'
import { DependencyIds } from '../constants.js'
import { container } from '../util/inversify.js'
import { StatisticsController } from '../modules/statistics/index.js'

const router = Express.Router()

const statisticsController = container.get<StatisticsController>(
  DependencyIds.statisticsController,
)

/**
 * Endpoint to retrieve total user, link, and click counts.
 */
router.get('/', statisticsController.getGlobalStatistics)

export default router
