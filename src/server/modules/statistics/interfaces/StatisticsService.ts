import { GlobalStatistics } from '..'

export interface StatisticsService {
  getGlobalStatistics: () => GlobalStatistics
}

export default StatisticsService
