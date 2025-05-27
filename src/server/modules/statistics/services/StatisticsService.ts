import { injectable } from 'inversify'
import * as interfaces from '../interfaces'
import { GlobalStatistics } from '..'
import { clickCount, linkCount, userCount } from '../../../config'

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
