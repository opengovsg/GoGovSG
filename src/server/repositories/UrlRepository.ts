/* eslint-disable class-methods-use-this */

import { inject, injectable } from 'inversify'
import { QueryTypes } from 'sequelize'
import { Url, UrlType, sanitise } from '../models/url'
import { NotFoundError } from '../util/error'
import { redirectClient } from '../redis'
import {
  logger,
  redirectExpiry,
  searchDescriptionWeight,
  searchShortUrlWeight,
} from '../config'
import { sequelize } from '../util/sequelize'
import { DependencyIds } from '../constants'
import { FileVisibility, S3Interface } from '../services/aws'
import { UrlRepositoryInterface } from './interfaces/UrlRepositoryInterface'
import { StorableFile, StorableUrl, UrlDirectory, UrlsPaginated } from './types'
import { StorableUrlState } from './enums'
import { Mapper } from '../mappers/Mapper'
import { SearchResultsSortOrder } from '../../shared/search'
import { urlSearchConditions, urlSearchVector } from '../models/search'

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

  public plainTextSearch: (
    query: string,
    order: SearchResultsSortOrder,
    limit: number,
    offset: number,
  ) => Promise<UrlsPaginated> = async (query, order, limit, offset) => {
    const { tableName } = Url

    const urlVector = urlSearchVector

    const count = await this.getPlainTextSearchResultsCount(tableName, query)

    const rankingAlgorithm = this.getRankingAlgorithm(order, tableName)

    const urlsModel = await this.getRelevantUrls(
      tableName,
      urlVector,
      rankingAlgorithm,
      limit,
      offset,
      query,
    )

    const urls = urlsModel.map((urlType) =>
      this.urlMapper.persistenceToDto(urlType),
    )

    return {
      count,
      urls,
    }
  }

  public rawDirectorySearch: (
    query: string,
    order: SearchResultsSortOrder,
    limit: number,
    offset: number,
    state: string | undefined,
    isFile: boolean | undefined,
    isEmail: boolean,
  ) => Promise<Array<UrlDirectory>> = async (
    query,
    order,
    limit,
    offset,
    state,
    isFile,
    isEmail,
  ) => {
    const { tableName } = Url

    const urlVector = urlSearchVector

    const rankingAlgorithm = this.getRankingAlgorithm(order, tableName)

    if (isEmail) {
      const emails = query.toString().split(' ')

      const likeQuery: Array<string> = []
      emails.forEach((domain) => {
        likeQuery.push(sanitise(domain))
      })

      const urlsModel = await this.getRelevantUrlsFromEmail(
        likeQuery,
        order,
        limit,
        offset,
        state,
        isFile,
      )

      return urlsModel
    }

    const urlsModel = await this.getRelevantUrlsFromText(
      urlVector,
      rankingAlgorithm,
      limit,
      offset,
      query,
      state,
      isFile,
    )

    return urlsModel
  }

  private async getRelevantUrlsFromEmail(
    likeQuery: Array<string>,
    order: string,
    limit: number,
    offset: number,
    state: string | undefined,
    isFile: boolean | undefined,
  ): Promise<Array<UrlDirectory>> {
    // ordering - default = relevance
    let queryOrder = `"urls"."createdAt"`
    if (order === 'popularity') queryOrder = `"urls".clicks`

    // isFile - default (if isFile is null) = [true, false]
    let queryFile = [true, false]
    if (isFile === true) queryFile = [true]
    else if (isFile === false) queryFile = [false]

    // state - default (if state is null) = ['ACTIVE', 'INACTIVE']
    let queryState = ['ACTIVE', 'INACTIVE']
    if (state === 'ACTIVE') queryState = ['ACTIVE']
    else if (state === 'INACTIVE') queryState = ['INACTIVE']

    console.log('inside get from email', likeQuery, queryFile, queryState)

    const rawQuery = `
      SELECT "users"."email", "urls"."shortUrl", "urls"."state"
      FROM urls AS "urls"
      JOIN users
      ON "urls"."userId" = "users"."id"
      AND "users"."email" LIKE ANY (ARRAY[:likeQuery])
      AND "urls"."isFile" IN (:queryFile)
      AND "urls"."state" In (:queryState)
      ORDER BY ${queryOrder} DESC
      LIMIT :limit
      OFFSET :offset`

    const urlsModel = (await sequelize.query(rawQuery, {
      replacements: {
        likeQuery,
        limit,
        offset,
        queryFile,
        queryState,
      },
      type: QueryTypes.SELECT,
      model: Url,
      raw: true,
      mapToModel: true,
    })) as Array<UrlDirectory>

    return urlsModel
  }

  private async getRelevantUrlsFromText(
    urlVector: string,
    rankingAlgorithm: string,
    limit: number,
    offset: number,
    query: string,
    state: string | undefined,
    isFile: boolean | undefined,
  ): Promise<Array<UrlDirectory>> {
    // isFile
    let queryFile = ''
    if (isFile === true) queryFile = `AND urls."isFile"=true`
    else if (isFile === false) queryFile = `AND urls."isFile"=false`

    // state
    let queryState = ''
    if (state === 'ACTIVE') queryState = `AND urls.state = 'ACTIVE'`
    else if (state === 'INACTIVE') queryState = `AND urls.state = 'INACTIVE'`

    const rawQuery = `
      SELECT "urls"."shortUrl", "users"."email", "urls"."state"
      FROM urls AS "urls"
      JOIN users
      ON "urls"."userId" = "users"."id"
      JOIN plainto_tsquery('english', $query) query
      ON query @@ (${urlVector})
      ${queryFile}
      ${queryState}
      ORDER BY (${rankingAlgorithm}) DESC
      LIMIT $limit
      OFFSET $offset`
    const urlsModel = (await sequelize.query(rawQuery, {
      bind: {
        limit,
        offset,
        query,
      },
      raw: true,
      type: QueryTypes.SELECT,
      model: Url,
      mapToModel: true,
    })) as Array<UrlDirectory>

    return urlsModel
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

  /**
   * Retrieves relevant urls from database based on the input search parameters.
   * @param  {string} tableName Name of the database table to retrieve from.
   * @param  {string} urlVector Vector representation of url.
   * @param  {string} rankingAlgorithm The ranking algorithm to be used.
   * @param  {number} limit Maximum number of results to be retrieved.
   * @param  {number} offset Number of results to ignore.
   * @param  {string} query The search query.
   * @returns Relevant urls in an array.
   */
  private async getRelevantUrls(
    tableName: string,
    urlVector: string,
    rankingAlgorithm: string,
    limit: number,
    offset: number,
    query: string,
  ): Promise<Array<UrlType>> {
    const rawQuery = `
      SELECT ${tableName}.*
      FROM ${tableName}, plainto_tsquery('english', $query) query
      WHERE query @@ (${urlVector}) AND ${urlSearchConditions}
      ORDER BY (${rankingAlgorithm}) DESC
      LIMIT $limit
      OFFSET $offset`
    const urlsModel = (await sequelize.query(rawQuery, {
      bind: {
        limit,
        offset,
        query,
      },
      type: QueryTypes.SELECT,
      model: Url,
      mapToModel: true,
    })) as Array<UrlType>
    return urlsModel
  }

  /**
   * Generates the ranking algorithm to be used in the ORDER BY clause in the
   * SQL statement based on the input sort order.
   * @param  {SearchResultsSortOrder} order
   * @param  {string} tableName
   * @returns The clause as a string.
   */
  private getRankingAlgorithm(
    order: SearchResultsSortOrder,
    tableName: string,
  ): string {
    let rankingAlgorithm
    console.log('the order is this', order)
    switch (order) {
      case SearchResultsSortOrder.Relevance:
        {
          // The 3rd argument passed into ts_rank_cd represents
          // the normalization option that specifies whether and how
          // a document's length should impact its rank. It works as a bit mask.
          // 1 divides the rank by 1 + the logarithm of the document length
          const textRanking = `ts_rank_cd('{0, 0, ${searchDescriptionWeight}, ${searchShortUrlWeight}}',${urlSearchVector}, query, 1)`
          rankingAlgorithm = `${textRanking} * log(${tableName}.clicks + 1)`
        }
        break
      case SearchResultsSortOrder.Recency:
        rankingAlgorithm = `${tableName}."createdAt"`
        break
      case SearchResultsSortOrder.Popularity:
        rankingAlgorithm = `${tableName}.clicks`
        break
      default:
        throw new Error(`Unsupported SearchResultsSortOrder: ${order}`)
    }
    return rankingAlgorithm
  }

  /**
   * Retrieves the number of urls that match the plain text search
   * query.
   * @param  {string} tableName Name of the table urls are stored in.
   * @param  {string} query Search query.
   * @returns Number of matching urls.
   */
  private async getPlainTextSearchResultsCount(
    tableName: string,
    query: string,
  ): Promise<number> {
    const rawCountQuery = `
      SELECT count(*)
      FROM ${tableName}, plainto_tsquery('english', $query) query
      WHERE query @@ (${urlSearchVector}) AND ${urlSearchConditions}
    `
    const [{ count: countString }] = await sequelize.query(rawCountQuery, {
      bind: {
        query,
      },
      raw: true,
      type: QueryTypes.SELECT,
    })
    const count = parseInt(countString, 10)
    return count
  }
}

export default UrlRepository
