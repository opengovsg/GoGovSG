import { injectable } from 'inversify'

import { UrlRepositoryInterface } from '../../../../src/server/repositories/interfaces/UrlRepositoryInterface'
import {
  StorableFile,
  StorableUrl,
} from '../../../../src/server/repositories/types'

@injectable()
export class MockUrlRepository implements UrlRepositoryInterface {
  findByShortUrl: (shortUrl: string) => Promise<StorableUrl | null> = () =>
    Promise.resolve({} as StorableUrl)

  update: (
    url: StorableUrl,
    changes: object,
    file?: StorableFile,
  ) => Promise<StorableUrl> = () => Promise.resolve({} as StorableUrl)

  create: (
    properties: { userId: number; shortUrl: string; longUrl?: string },
    file?: StorableFile,
  ) => Promise<StorableUrl> = () => Promise.resolve({} as StorableUrl)

  getLongUrl: (shortUrl: string) => Promise<string> = (shortUrl) =>
    Promise.resolve(shortUrl)

  incrementClick: (
    shortUrl: string,
    transaction?: import('sequelize/types').Transaction,
  ) => Promise<void> = () => Promise.resolve()

  updateDailyStatistics: (
    shortUrl: string,
    transaction?: import('sequelize/types').Transaction,
  ) => Promise<void> = () => Promise.resolve()

  updateWeekdayStatistics: (
    shortUrl: string,
    transaction?: import('sequelize/types').Transaction,
  ) => Promise<void> = () => Promise.resolve()

  updateDeviceStatistics: (
    shortUrl: string,
    userAgent: string,
    transaction?: import('sequelize/types').Transaction,
  ) => Promise<void> = () => Promise.resolve()
}

export default MockUrlRepository
