import { GlobalStatistics } from '../types'

export interface StatisticsRepositoryInterface {
  /**
   * Retrieves the global statistics from the store.
   * These include total click, link and user count.
   * @returns Promise that resolves to an object that encapsulates statistics.
   */
  getGlobalStatistics(): Promise<GlobalStatistics>
}
