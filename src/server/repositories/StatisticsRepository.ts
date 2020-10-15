/* eslint-disable class-methods-use-this */

import { injectable } from 'inversify'
import { User } from '../models/user'
import { Url } from '../models/url'
import { statClient } from '../redis'
import { logger, statisticsExpiry } from '../config'
import { StatisticsRepositoryInterface } from './interfaces/StatisticsRepositoryInterface'
import { GlobalStatistics } from './types'

const USER_COUNT_KEY = 'userCount'
const CLICK_COUNT_KEY = 'clickCount'
const LINK_COUNT_KEY = 'linkCount'

@injectable()
export class StatisticsRepository implements StatisticsRepositoryInterface {
  public getGlobalStatistics: () => Promise<GlobalStatistics> = async () => {
    const counts = await this.tryGetFromCache([
      USER_COUNT_KEY,
      CLICK_COUNT_KEY,
      LINK_COUNT_KEY,
    ])

    let [userCount, clickCount, linkCount] = counts.map((count) =>
      count != null ? Number(count) : null,
    )

    if (userCount == null) {
      userCount = await User.count()
      this.trySetCache(USER_COUNT_KEY, userCount.toString())
    }

    if (clickCount == null) {
      // Replace Nan with 0 if there is no data
      clickCount = (await Url.sum('clicks')) || 0
      this.trySetCache(CLICK_COUNT_KEY, clickCount.toString())
    }

    if (linkCount == null) {
      linkCount = await Url.count()
      this.trySetCache(LINK_COUNT_KEY, linkCount.toString())
    }

    return { linkCount, clickCount, userCount }
  }

  private tryGetFromCache(keys: string[]): Promise<(string | null)[]> {
    return new Promise((resolve) =>
      statClient.mget(keys, (cacheError, result) => {
        if (cacheError) {
          logger.error(
            `Access to statistics cache failed unexpectedly:\t${cacheError}`,
          )
          resolve(keys.map(() => null))
        }
        resolve(result)
      }),
    )
  }

  private trySetCache(key: string, value: string): void {
    statClient.set(key, value, 'EX', statisticsExpiry, (err: Error | null) => {
      if (err) {
        logger.error(`Cache write failed:\t${err}`)
      }
    })
  }
}

export default StatisticsRepository
