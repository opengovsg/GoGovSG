/* eslint-disable class-methods-use-this */

import { injectable } from 'inversify'
import { UrlRepositoryInterface } from '../../../../src/server/repositories/interfaces/UrlRepositoryInterface'
import {
  StorableFile,
  StorableUrl,
  UrlDirectoryPaginated,
} from '../../../../src/server/repositories/types'

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

  getRelevantUrlsFromEmail: (
    likeQuery: string[],
    rankingAlgorithm: string,
    limit: number,
    offset: number,
    queryState: string[],
    queryFile: boolean[],
  ) => Promise<UrlDirectoryPaginated> = () => {
    return Promise.resolve({
      urls: [
        {
          shortUrl: 'test-moh',
          state: 'ACTIVE',
          isFile: false,
          email: 'test@test.gov.sg',
        },
      ],
      count: 0,
    })
  }

  getRelevantUrlsFromText: (
    urlVector: string,
    rankingAlgorithm: string,
    limit: number,
    offset: number,
    query: string,
    queryState: string,
    queryFile: string,
  ) => Promise<UrlDirectoryPaginated> = () => {
    return Promise.resolve({
      urls: [
        {
          shortUrl: 'test-moh',
          state: 'ACTIVE',
          isFile: false,
          email: 'test@test.gov.sg',
        },
      ],
      count: 0,
    })
  }
}

export default UrlRepositoryMock
