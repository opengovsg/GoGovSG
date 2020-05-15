/* eslint-disable max-classes-per-file, class-methods-use-this */
import { injectable } from 'inversify'
import { NotFoundError } from '../../../../src/server/util/error'
import { UrlRepository } from '../../../../src/server/api/repositories/url'

@injectable()
export class UrlRepositoryMockFilled implements UrlRepository {
  clicks = new Map<string, number>()

  getLongUrlFromDatabase(_: string): Promise<string> {
    return Promise.resolve('longUrlFromDb')
  }

  incrementClick = (shortUrl: string) => {
    if (!this.clicks.has(shortUrl)) {
      this.clicks.set(shortUrl, 1)
    } else {
      this.clicks.set(shortUrl, this.clicks.get(shortUrl)! + 1)
    }

    return Promise.resolve()
  }
}

@injectable()
export class UrlRepositoryMockEmpty implements UrlRepository {
  clicks = new Map<string, number>()

  getLongUrlFromDatabase(shortUrl: string): Promise<string> {
    return Promise.reject(
      new NotFoundError(`longUrl not found in database:\tshortUrl=${shortUrl}`),
    )
  }

  incrementClick = (shortUrl: string) => {
    if (!this.clicks.has(shortUrl)) {
      this.clicks.set(shortUrl, 1)
    } else {
      this.clicks.set(shortUrl, this.clicks.get(shortUrl)! + 1)
    }

    return Promise.resolve()
  }
}

@injectable()
export class UrlRepositoryMockDown implements UrlRepository {
  clicks = 0

  getLongUrlFromDatabase(_: string): Promise<string> {
    return Promise.reject(new Error('Database is down'))
  }

  incrementClick(_: string) {
    return Promise.reject(Error('Database is down'))
  }
}
