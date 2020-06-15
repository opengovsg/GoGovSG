import { GlobalStatistics } from '../../repositories/types'

export interface StatisticsServiceInterface {
  getGlobalStatistics(): Promise<GlobalStatistics>
}
