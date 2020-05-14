/* eslint-disable max-classes-per-file, class-methods-use-this */
import { injectable } from 'inversify'
import { NotFoundError } from '../../../../src/server/util/error'
import { UrlCache } from '../../../../src/server/api/cache/url'

@injectable()
export class UrlCacheMockFilled implements UrlCache {
  cache = new Map<string, string>()

  cacheShortUrl = (shortUrl: string, longUrl: string) => {
    this.cache.set(shortUrl, longUrl)
    return Promise.resolve()
  }

  getLongUrlFromCache(shortUrl: string): Promise<string> {
    return Promise.resolve(shortUrl)
  }
}

@injectable()
export class UrlCacheMockEmpty implements UrlCache {
  cache = new Map<string, string>()

  cacheShortUrl = (shortUrl: string, longUrl: string) => {
    this.cache.set(shortUrl, longUrl)
    return Promise.resolve()
  }

  getLongUrlFromCache(shortUrl: string): Promise<string> {
    return Promise.reject(
      new NotFoundError(`longUrl not found in cache:\tshortUrl=${shortUrl}`),
    )
  }
}

@injectable()
export class UrlCacheMockDown implements UrlCache {
  cacheShortUrl(__: string, _: string): Promise<void> {
    return Promise.reject(new Error('Cache is down'))
  }

  getLongUrlFromCache(_: string): Promise<string> {
    return Promise.reject(new Error('Cache is down'))
  }
}
