/* eslint-disable class-methods-use-this */

import { injectable } from 'inversify'
import { UrlRepositoryInterface } from '../../../../src/server/repositories/interfaces/UrlRepositoryInterface'
import {
  StorableFile,
  StorableUrl,
  UrlsPaginated,
} from '../../../../src/server/repositories/types'
import { StorableUrlState } from '../../../../src/server/repositories/enums'
import { SearchResultsSortOrder } from '../../../../src/shared/search'

@injectable()
export class UrlRepositoryMock implements UrlRepositoryInterface {
  findByShortUrl: (shortUrl: string) => Promise<StorableUrl | null> = () => {
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

  getLongUrl: (shortUrl: string) => Promise<string> = () => {
    throw new Error('Not implemented')
  }

  incrementClick: (shortUrl: string) => Promise<void> = () => {
    throw new Error('Not implemented')
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
        },
      ],
      count: 0,
    })
  }
}

export default UrlRepositoryMock
