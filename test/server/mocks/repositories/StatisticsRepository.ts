/* eslint-disable class-methods-use-this */

import { injectable } from 'inversify'
import { StatisticsRepositoryInterface } from '../../../../src/server/repositories/interfaces/StatisticsRepositoryInterface'
import { GlobalStatistics } from '../../../../src/server/repositories/types'

@injectable()
export class MockStatisticsRepository implements StatisticsRepositoryInterface {
  getGlobalStatistics(): Promise<GlobalStatistics> {
    return Promise.resolve({ userCount: 1, clickCount: 2, linkCount: 3 })
  }
}

export default MockStatisticsRepository
