import Express from 'express'
import { DependencyIds } from '../constants'
import { container } from '../util/inversify'
import { StatisticsController } from '../modules/statistics'

const router = Express.Router()

const statisticsController = container.get<StatisticsController>(
  DependencyIds.statisticsController,
)

/**
 * Endpoint to retrieve total user, link, and click counts.
 */
router.get('/', statisticsController.getGlobalStatistics)

export = router
