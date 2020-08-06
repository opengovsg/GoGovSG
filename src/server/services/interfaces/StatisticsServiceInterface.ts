import { GlobalStatistics } from '../../repositories/types'

export interface StatisticsServiceInterface {
  /**
   * Retrieves global statistics from the data store.
   * @returns Promise that resolves to the global statistics.
   */
  getGlobalStatistics(): Promise<GlobalStatistics>
}
