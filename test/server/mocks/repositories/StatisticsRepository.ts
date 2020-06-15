/* eslint-disable class-methods-use-this */

import { injectable } from 'inversify'
import { IStatisticsRepository } from '../../../../src/server/repositories/interfaces/IStatisticsRepository'

@injectable()
export class MockStatisticsRepository implements IStatisticsRepository {
  getGlobalUserCount(): Promise<number> {
    return Promise.resolve(1)
  }

  getGlobalClickCount(): Promise<number> {
    return Promise.resolve(2)
  }

  getGlobalLinkCount(): Promise<number> {
    return Promise.resolve(3)
  }
}

export default MockStatisticsRepository
