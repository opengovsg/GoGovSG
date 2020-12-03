/* eslint-disable class-methods-use-this */

import { inject, injectable } from 'inversify'
import { QueryTypes } from 'sequelize'
import { Url, UrlType } from '../models/url'
import { NotFoundError } from '../util/error'
import { redirectClient } from '../redis'
import { logger, redirectExpiry } from '../config'
import { sequelize } from '../util/sequelize'
import { DependencyIds } from '../constants'
import { FileVisibility, S3Interface } from '../services/aws'
import { UrlRepositoryInterface } from './interfaces/UrlRepositoryInterface'
import {
  StorableFile,
  StorableUrl,
  UrlDirectory,
  UrlDirectoryPaginated,
} from './types'
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
    originalUrl: { shortUrl: string },
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

  public async getRelevantUrlsFromEmail(
    likeQuery: string[],
    rankingAlgorithm: string,
    limit: number,
    offset: number,
    queryState: string[],
    queryFile: boolean[],
  ): Promise<UrlDirectoryPaginated> {
    // TODO: optimize the search query, possibly with reverse-email search
    const rawQuery = `
      SELECT "users"."email", "urls"."shortUrl", "urls"."state", "urls"."isFile"
      FROM urls AS "urls"
      JOIN users
      ON "urls"."userId" = "users"."id"
      AND "users"."email" LIKE ANY (ARRAY[:likeQuery])
      AND "urls"."isFile" IN (:queryFile)
      AND "urls"."state" In (:queryState)
      ORDER BY (${rankingAlgorithm}) DESC`

    // Search only once to get both urls and count
    const urlsModel = (await sequelize.query(rawQuery, {
      replacements: {
        likeQuery,
        queryFile,
        queryState,
      },
      type: QueryTypes.SELECT,
      model: Url,
      raw: true,
      mapToModel: true,
    })) as Array<UrlDirectory>

    const count = urlsModel.length
    const ending = Math.min(count, offset + limit)
    const slicedUrlsModel = urlsModel.slice(offset, ending)

    return { count, urls: slicedUrlsModel }
  }

  public async getRelevantUrlsFromText(
    urlVector: string,
    rankingAlgorithm: string,
    limit: number,
    offset: number,
    query: string,
    queryState: string,
    queryFile: string,
  ): Promise<UrlDirectoryPaginated> {
    const rawQuery = `
      SELECT "urls"."shortUrl", "users"."email", "urls"."state", "urls"."isFile"
      FROM urls AS "urls"
      JOIN users
      ON "urls"."userId" = "users"."id"
      JOIN plainto_tsquery('english', $query) query
      ON query @@ (${urlVector})
      ${queryFile}
      ${queryState}
      ORDER BY (${rankingAlgorithm}) DESC`

    // Search only once to get both urls and count
    const urlsModel = (await sequelize.query(rawQuery, {
      bind: {
        query,
      },
      raw: true,
      type: QueryTypes.SELECT,
      model: Url,
      mapToModel: true,
    })) as Array<UrlDirectory>

    const count = urlsModel.length
    const ending = Math.min(count, offset + limit)
    const slicedUrlsModel = urlsModel.slice(offset, ending)

    return { count, urls: slicedUrlsModel }
  }

  /**
   * Invalidates the redirect entry on the cache for the input
   * short url.
   * @param  {string} shortUrl The short url to invalidate.
   */
  private invalidateCache: (shortUrl: string) => Promise<void> = async (
    shortUrl,
  ) => {
    redirectClient.del(shortUrl, (err) => {
      if (err) {
        logger.error(`Short URL could not be purged from cache:\t${err}`)
      }
    })
  }

  /**
   * Retrieves the long url which the short url redirects to
   * from the database.
   * @param  {string} shortUrl Short url.
   * @returns The long url that the short url redirects to.
   */
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

  /**
   * Retrieves the long url which the short url redirects to
   * from the cache.
   * @param  {string} shortUrl Short url.
   * @returns The long url that the short url redirects to.
   */
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

  /**
   * Caches the input short url to long url mapping in redis cache.
   * @param  {string} shortUrl Short url.
   * @param  {string} longUrl Long url.
   */
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
