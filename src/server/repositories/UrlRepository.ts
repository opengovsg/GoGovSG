import { inject, injectable } from 'inversify'

import { Url, UrlType } from '../models/url'
import { NotFoundError } from '../util/error'
import { redirectClient } from '../redis'
import { logger, redirectExpiry } from '../config'
import { sequelize } from '../util/sequelize'
import { DependencyIds } from '../constants'
import { FileVisibility, S3Interface } from '../services/aws'
import { UrlRepositoryInterface } from './interfaces/UrlRepositoryInterface'
import { StorableFile, StorableUrl } from './types'
import { StorableUrlState } from './enums'
import { Mapper } from '../mappers/Mapper'

const { Public, Private } = FileVisibility
/**
 * A url repository that handles access to the data store of Urls.
 * The following implementation uses Sequelize, AWS S3 and Redis.
 */
@injectable()
export class UrlRepository implements UrlRepositoryInterface {
  private fileBucket: S3Interface

  private urlMapper: Mapper<StorableUrl, UrlType>

  public constructor(
    @inject(DependencyIds.s3) fileBucket: S3Interface,
    @inject(DependencyIds.urlMapper) urlMapper: Mapper<StorableUrl, UrlType>,
  ) {
    this.fileBucket = fileBucket
    this.urlMapper = urlMapper
  }

  public findByShortUrl: (
    shortUrl: string,
  ) => Promise<StorableUrl | null> = async (shortUrl) => {
    return (await Url.findOne({
      where: { shortUrl },
    })) as StorableUrl | null
  }

  public create: (
    properties: { userId: number; shortUrl: string; longUrl?: string },
    file?: StorableFile,
  ) => Promise<StorableUrl> = async (properties, file) => {
    const newUrl = await sequelize.transaction(async (t) => {
      const url = Url.create(
        {
          ...properties,
          longUrl: file
            ? this.fileBucket.buildFileLongUrl(file.key)
            : properties.longUrl,
          isFile: !!file,
        },
        { transaction: t },
      )
      if (file) {
        await this.fileBucket.uploadFileToS3(file.data, file.key, file.mimetype)
      }
      return url
    })

    return this.urlMapper.persistenceToDto(newUrl)
  }

  public update: (
    originalUrl: StorableUrl,
    changes: Partial<StorableUrl>,
    file?: StorableFile,
  ) => Promise<StorableUrl> = async (originalUrl, changes, file) => {
    const { shortUrl } = originalUrl
    const url = await Url.findOne({ where: { shortUrl } })
    if (!url) {
      throw new NotFoundError(
        `url not found in database:\tshortUrl=${shortUrl}`,
      )
    }

    const newUrl: UrlType = await sequelize.transaction(async (t) => {
      if (!url.isFile) {
        await url.update(changes, { transaction: t })
      } else {
        let currentKey = this.fileBucket.getKeyFromLongUrl(url.longUrl)
        if (file) {
          const newKey = file.key
          await url.update(
            { ...changes, longUrl: this.fileBucket.buildFileLongUrl(newKey) },
            { transaction: t },
          )
          await this.fileBucket.setS3ObjectACL(currentKey, Private)
          await this.fileBucket.uploadFileToS3(file.data, newKey, file.mimetype)
          currentKey = newKey
        } else {
          await url.update({ ...changes }, { transaction: t })
        }
        if (changes.state) {
          await this.fileBucket.setS3ObjectACL(
            currentKey,
            changes.state === StorableUrlState.Active ? Public : Private,
          )
        }
      }
      return url
    })

    this.invalidateCache(shortUrl)

    return this.urlMapper.persistenceToDto(newUrl)
  }

  public getLongUrl: (shortUrl: string) => Promise<string> = async (
    shortUrl,
  ) => {
    try {
      // Cache lookup
      return await this.getLongUrlFromCache(shortUrl)
    } catch {
      // Cache failed, look in database
      const longUrl = await this.getLongUrlFromDatabase(shortUrl)
      this.cacheShortUrl(shortUrl, longUrl).catch((error) =>
        logger.error(`Unable to cache short URL: ${error}`),
      )
      return longUrl
    }
  }

  private invalidateCache: (shortUrl: string) => Promise<void> = async (
    shortUrl,
  ) => {
    redirectClient.del(shortUrl, (err) => {
      if (err) {
        logger.error(`Short URL could not be purged from cache:\t${err}`)
      }
    })
  }

  private getLongUrlFromDatabase: (
    shortUrl: string,
  ) => Promise<string> = async (shortUrl) => {
    const url = await Url.findOne({
      where: { shortUrl, state: StorableUrlState.Active },
    })
    if (!url) {
      throw new NotFoundError(
        `shortUrl not found in database:\tshortUrl=${shortUrl}`,
      )
    }
    return url.longUrl
  }

  private getLongUrlFromCache: (shortUrl: string) => Promise<string> = (
    shortUrl,
  ) => {
    return new Promise((resolve, reject) =>
      redirectClient.get(shortUrl, (cacheError, cacheLongUrl) => {
        if (cacheError) {
          logger.error(`Cache lookup failed unexpectedly:\t${cacheError}`)
          reject(cacheError)
        } else {
          if (!cacheLongUrl) {
            reject(
              new NotFoundError(
                `longUrl not found in cache:\tshortUrl=${shortUrl}`,
              ),
            )
          }
          resolve(cacheLongUrl)
        }
      }),
    )
  }

  private cacheShortUrl: (
    shortUrl: string,
    longUrl: string,
  ) => Promise<void> = (shortUrl, longUrl) => {
    return new Promise((resolve, reject) => {
      redirectClient.set(shortUrl, longUrl, 'EX', redirectExpiry, (err) => {
        if (err) reject(err)
        else resolve()
      })
    })
  }
}

export default UrlRepository
