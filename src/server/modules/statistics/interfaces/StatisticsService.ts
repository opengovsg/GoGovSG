import { GlobalStatistics } from '..'

export interface StatisticsService {
  getGlobalStatistics: () => Promise<GlobalStatistics>
}

export default StatisticsService
