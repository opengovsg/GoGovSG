import { injectable } from 'inversify'
import * as interfaces from '../interfaces/index.js'
import { GlobalStatistics } from '../index.js'
import { clickCount, linkCount, userCount } from '../../../config.js'

@injectable()
export class StatisticsService implements interfaces.StatisticsService {
  getGlobalStatistics: () => GlobalStatistics = () => {
    return {
      userCount,
      clickCount,
      linkCount,
    }
  }
}

export default StatisticsService
