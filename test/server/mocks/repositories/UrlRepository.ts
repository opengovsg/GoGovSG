/* eslint-disable class-methods-use-this */

import { injectable } from 'inversify'
import { UrlRepositoryInterface } from '../../../../src/server/repositories/interfaces/UrlRepositoryInterface'
import {
  BulkUrlMapping,
  StorableFile,
  StorableUrl,
  UrlDirectoryPaginated,
  UrlsPaginated,
} from '../../../../src/server/repositories/types'
import {
  StorableUrlSource,
  StorableUrlState,
} from '../../../../src/server/repositories/enums'
import { SearchResultsSortOrder } from '../../../../src/shared/search'
import { DirectoryQueryConditions } from '../../../../src/server/modules/directory'

@injectable()
export class UrlRepositoryMock implements UrlRepositoryInterface {
  findByShortUrlWithTotalClicks: (
    shortUrl: string,
  ) => Promise<StorableUrl | null> = () => {
    throw new Error('Not implemented')
  }

  update: (
    url: StorableUrl,
    changes: object,
    file?: StorableFile,
  ) => Promise<StorableUrl> = () => {
    throw new Error('Not implemented')
  }

  create: (
    properties: { userId: number; shortUrl: string; longUrl?: string },
    file?: StorableFile,
  ) => Promise<StorableUrl> = () => {
    throw new Error('Not implemented')
  }

  isShortUrlAvailable: (shortUrl: string) => Promise<boolean> = () => {
    throw new Error('Not implemented')
  }

  getLongUrl: (shortUrl: string) => Promise<string> = () => {
    throw new Error('Not implemented')
  }

  rawDirectorySearch: (
    condition: DirectoryQueryConditions,
  ) => Promise<UrlDirectoryPaginated> = () => {
    return Promise.resolve({
      urls: [
        {
          longUrl: 'https://test-moh.com',
          shortUrl: 'test-moh',
          state: 'ACTIVE',
          isFile: false,
          email: 'test@test.gov.sg',
        },
      ],
      count: 0,
    })
  }

  plainTextSearch: (
    query: string,
    order: SearchResultsSortOrder,
    limit: number,
    offset: number,
  ) => Promise<UrlsPaginated> = () => {
    return Promise.resolve({
      urls: [
        {
          shortUrl: 'test-moh',
          longUrl: 'https://www.moh.gov.sg/covid-19',
          state: StorableUrlState.Active,
          isFile: false,
          createdAt: '2020-04-17T09:10:07.491Z',
          updatedAt: '2020-06-09T10:07:07.557Z',
          description: '',
          contactEmail: null,
          clicks: 0,
          source: StorableUrlSource.Console,
          tagStrings: '',
        },
      ],
      count: 0,
    })
  }

  bulkCreate: (properties: {
    userId: number
    urlMappings: BulkUrlMapping[]
  }) => Promise<void> = () => {
    return Promise.resolve()
  }
}

export default UrlRepositoryMock
