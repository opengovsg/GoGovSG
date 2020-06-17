import Express from 'express'
import { DependencyIds } from '../constants'
import { container } from '../util/inversify'
import { StatisticsControllerInterface } from '../controllers/interfaces/StatisticsControllerInterface'

const router = Express.Router()

const statisticsController = container.get<StatisticsControllerInterface>(
  DependencyIds.statisticsController,
)

/**
 * Endpoint to retrieve total user, link, and click counts.
 */
router.get('/', statisticsController.getGlobalStatistics)

export = router
