import { GlobalStatistics } from '../index.js'

export interface StatisticsService {
  getGlobalStatistics: () => GlobalStatistics
}

export default StatisticsService
