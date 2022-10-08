/* eslint-disable class-methods-use-this */

import { inject, injectable } from 'inversify'
import { QueryTypes } from 'sequelize'
import _ from 'lodash'
import { Url, UrlType } from '../models/url'
import { UrlClicks } from '../models/statistics/clicks'
import { NotFoundError } from '../util/error'
import { redirectClient } from '../redis'
import { logger, redirectExpiry } from '../config'
import { sequelize } from '../util/sequelize'
import { DependencyIds } from '../constants'
import { FileVisibility, S3Interface } from '../services/aws'
import { UrlRepositoryInterface } from './interfaces/UrlRepositoryInterface'
import {
  BulkUrlMapping,
  StorableFile,
  StorableUrl,
  UrlDirectory,
  UrlDirectoryPaginated,
} from './types'
import { StorableUrlSource, StorableUrlState } from './enums'
import { Mapper } from '../mappers/Mapper'
import { SearchResultsSortOrder } from '../../shared/search'
import { urlSearchVector } from '../models/search'
import { DirectoryQueryConditions } from '../modules/directory'
import { extractShortUrl, sanitiseQuery } from '../util/parse'
import { TagRepositoryInterface } from './interfaces/TagRepositoryInterface'
import { TAG_SEPARATOR } from '../../shared/constants'

const { Public, Private } = FileVisibility

export const tagSeparator = ';'

/**
 * A url repository that handles access to the data store of Urls.
 * The following implementation uses Sequelize, AWS S3 and Redis.
 */
@injectable()
export class UrlRepository implements UrlRepositoryInterface {
  private fileBucket: S3Interface

  private urlMapper: Mapper<StorableUrl, UrlType>

  private tagRepository: TagRepositoryInterface

  public constructor(
    @inject(DependencyIds.s3) fileBucket: S3Interface,
    @inject(DependencyIds.urlMapper) urlMapper: Mapper<StorableUrl, UrlType>,
    @inject(DependencyIds.tagRepository) tagRepository: TagRepositoryInterface,
  ) {
    this.fileBucket = fileBucket
    this.urlMapper = urlMapper
    this.tagRepository = tagRepository
  }

  public findByShortUrlWithTotalClicks: (
    shortUrl: string,
  ) => Promise<StorableUrl | null> = async (shortUrl) => {
    const url = await Url.scope(['defaultScope', 'getClicks']).findOne({
      where: { shortUrl },
    })
    return this.urlMapper.persistenceToDto(url)
  }

  public create: (
    properties: {
      userId: number
      shortUrl: string
      longUrl?: string
      tags?: string[]
    },
    file?: StorableFile,
  ) => Promise<StorableUrl> = async (properties, file) => {
    const newUrl = await sequelize.transaction(async (t) => {
      const tagStrings = properties.tags
        ? properties.tags.join(TAG_SEPARATOR)
        : ''
      const urlStaticDTO = {
        ...properties,
        longUrl: file
          ? this.fileBucket.buildFileLongUrl(file.key)
          : properties.longUrl,
        isFile: !!file,
        tagStrings,
        source: StorableUrlSource.Console,
      }
      const url = await Url.create(urlStaticDTO, {
        transaction: t,
      })
      if (properties.tags) {
        const tags = await this.tagRepository.upsertTags(properties.tags, t)
        // @ts-ignore, addTag is provided by Sequelize during run time
        // https://sequelize.org/docs/v6/core-concepts/assocs/#special-methodsmixins-added-to-instances
        await url.addTags(tags, { transaction: t })
      }
      if (file) {
        await this.fileBucket.uploadFileToS3(file.data, file.key, file.mimetype)
      }

      // Do a fresh read which eagerly loads the associated UrlClicks field.
      return Url.scope(['defaultScope', 'getClicks', 'getTags']).findByPk(
        properties.shortUrl,
        {
          transaction: t,
        },
      )
    })

    if (!newUrl) throw new Error('Newly-created url is null')
    return this.urlMapper.persistenceToDto(newUrl)
  }

  public update: (
    originalUrl: { shortUrl: string },
    changes: Partial<StorableUrl>,
    file?: StorableFile,
  ) => Promise<StorableUrl> = async (originalUrl, changes, file) => {
    const { shortUrl } = originalUrl
    let updateParams: any = { ...changes }
    const url = await Url.scope(['defaultScope', 'getClicks']).findOne({
      where: { shortUrl },
    })
    if (!url) {
      throw new NotFoundError(
        `url not found in database:\tshortUrl=${shortUrl}`,
      )
    }
    const urlDto = this.urlMapper.persistenceToDto(url)
    const newUrl = await sequelize.transaction(async (t) => {
      if (
        changes.tags &&
        !_.isEqual(_.sortBy(urlDto.tags), _.sortBy(changes.tags))
      ) {
        const newTags = await this.tagRepository.upsertTags(changes.tags, t)
        // @ts-ignore provided by Sequelize during runtime
        await url.setTags(newTags, { transaction: t })
        updateParams = {
          ...updateParams,
          tagStrings: updateParams.tags.join(TAG_SEPARATOR),
        }
      }
      if (!url.isFile) {
        await url.update(updateParams, { transaction: t })
      } else {
        let currentKey = this.fileBucket.getKeyFromLongUrl(url.longUrl)
        if (file) {
          const newKey = file.key
          await url.update(
            {
              ...updateParams,
              longUrl: this.fileBucket.buildFileLongUrl(newKey),
            },
            { transaction: t },
          )
          await this.fileBucket.setS3ObjectACL(currentKey, Private)
          await this.fileBucket.uploadFileToS3(file.data, newKey, file.mimetype)
          currentKey = newKey
        } else {
          await url.update(updateParams, { transaction: t })
        }
        if (updateParams.state) {
          await this.fileBucket.setS3ObjectACL(
            currentKey,
            updateParams.state === StorableUrlState.Active ? Public : Private,
          )
        }
      }
      // Do a fresh read which eagerly loads the associated tags field.
      return Url.scope(['defaultScope', 'getClicks']).findOne({
        where: { shortUrl },
        transaction: t,
      })
    })
    if (!newUrl) throw new Error('Newly-updated url is null')
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

  public rawDirectorySearch: (
    conditions: DirectoryQueryConditions,
  ) => Promise<UrlDirectoryPaginated> = async (conditions) => {
    const { query, order, limit, offset, state, isFile, isEmail } = conditions
    const { tableName: urlTableName } = Url
    const { tableName: urlClicksTableName } = UrlClicks

    const urlVector = urlSearchVector

    const rankingAlgorithm = this.getRankingAlgorithm(
      order,
      urlTableName,
      urlClicksTableName,
    )

    const urlsModel = await (isEmail
      ? this.getRelevantUrlsFromEmail(
          query,
          rankingAlgorithm,
          limit,
          offset,
          state,
          isFile,
        )
      : this.getRelevantUrlsFromText(
          urlVector,
          rankingAlgorithm,
          limit,
          offset,
          query,
          state,
          isFile,
        ))

    return urlsModel
  }

  /**
   * Using sequelize SQL replacement to query urls that matches the email search parameters.
   * Returns the urls and count.
   * @param  {string} query Keyword search query.
   * @param  {string} rankingAlgorithm Order by SQL string.
   * @param  {number} limit Maximum number of results.
   * @param  {number} offset Number of results skip.
   * @param  {string | undefined} state State of Url.
   * @param  {boolean | undefined} isFile Type of Url.
   * @returns {Promise<UrlDirectoryPaginated>} Returns shorturl, email, state, type and longurl of urls and count.
   */
  private async getRelevantUrlsFromEmail(
    query: string,
    rankingAlgorithm: string,
    limit: number,
    offset: number,
    state: string | undefined,
    isFile: boolean | undefined,
  ): Promise<UrlDirectoryPaginated> {
    const emails = query.toString().split(' ')
    // split email/domains by space into tokens, also reduces injections
    const likeQuery = emails.map(sanitiseQuery)

    const queryFile = this.getQueryFileEmail(isFile)
    const queryState = this.getQueryStateEmail(state)

    // TODO: optimize the search query, possibly with reverse-email search
    const rawQuery = `
      SELECT "users"."email", "urls"."shortUrl", "urls"."state", "urls"."isFile", "urls"."longUrl"
      FROM urls AS "urls"
      JOIN url_clicks
      ON "urls"."shortUrl" = "url_clicks"."shortUrl"
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
      useMaster: true,
    })) as Array<UrlDirectory>

    const count = urlsModel.length
    const ending = Math.min(count, offset + limit)
    const slicedUrlsModel = urlsModel.slice(offset, ending)

    return { count, urls: slicedUrlsModel }
  }

  /**
   * Using sequelize SQL replacement to query urls that matches the keyword parameters.
   * Returns the urls and count.
   * @param  {string} urlVector Full text search column vector.
   * @param  {string} rankingAlgorithm Order by SQL string.
   * @param  {number} limit Maximum number of results.
   * @param  {number} offset Number of results skip.
   * @param  {string} query Keyword search query.
   * @param  {string | undefined} state State of Url.
   * @param  {boolean | undefined} isFile Type of Url.
   * @returns {Promise<UrlDirectoryPaginated>} Returns shorturl, email, state, type and longurl of urls and count.
   */
  private async getRelevantUrlsFromText(
    urlVector: string,
    rankingAlgorithm: string,
    limit: number,
    offset: number,
    query: string,
    state: string | undefined,
    isFile: boolean | undefined,
  ): Promise<UrlDirectoryPaginated> {
    // Extract shortUrls with regex
    const newQuery = extractShortUrl(query) || query
    const queryFile = this.getQueryFileText(isFile)
    const queryState = this.getQueryStateText(state)
    const rawQuery = `
      SELECT "urls"."shortUrl", "users"."email", "urls"."state", "urls"."isFile"
      FROM urls AS "urls"
      JOIN url_clicks
      ON "urls"."shortUrl" = "url_clicks"."shortUrl"
      JOIN users
      ON "urls"."userId" = "users"."id"
      JOIN plainto_tsquery('english', $newQuery) query
      ON query @@ (${urlVector})
      ${queryFile}
      ${queryState}
      ORDER BY (${rankingAlgorithm}) DESC`

    // Search only once to get both urls and count
    const urlsModel = (await sequelize.query(rawQuery, {
      bind: {
        newQuery,
      },
      raw: true,
      type: QueryTypes.SELECT,
      model: Url,
      mapToModel: true,
      useMaster: true,
    })) as Array<UrlDirectory>

    const count = urlsModel.length
    const ending = Math.min(count, offset + limit)
    const slicedUrlsModel = urlsModel.slice(offset, ending)

    return { count, urls: slicedUrlsModel }
  }

  /**
   * Converts isFile logic into usable SQL query substitution for email query.
   * @param  {boolean | undefined} isFile Type of Url.
   * @returns {Array<boolean>} Usable SQL query substitution.
   */
  private getQueryFileEmail: (isFile: boolean | undefined) => Array<boolean> = (
    isFile,
  ) => {
    let queryFile = [true, false]
    if (isFile === true) queryFile = [true]
    else if (isFile === false) queryFile = [false]

    return queryFile
  }

  /**
   * Converts state logic into usable SQL query substitution for email query.
   * @param  {string | undefined} state State of Url.
   * @returns {Array<string>} Usable SQL query substitution.
   */
  private getQueryStateEmail: (state: string | undefined) => Array<string> = (
    state,
  ) => {
    let queryState = ['ACTIVE', 'INACTIVE']
    if (state === 'ACTIVE') queryState = ['ACTIVE']
    else if (state === 'INACTIVE') queryState = ['INACTIVE']

    return queryState
  }

  /**
   * Converts file logic into usable SQL query substitution for keyword query.
   * @param  {boolean | undefined} isFile Type of Url.
   * @returns {string} Usable SQL query substitution.
   */
  private getQueryFileText: (isFile: boolean | undefined) => string = (
    isFile,
  ) => {
    let queryFile = ''
    if (isFile === true) queryFile = `AND urls."isFile"=true`
    else if (isFile === false) queryFile = `AND urls."isFile"=false`

    return queryFile
  }

  /**
   * Converts state logic into usable SQL query substitution for keyword query.
   * @param  {string | undefined} state State of Url.
   * @returns {string} Usable SQL query substitution.
   */
  private getQueryStateText: (state: string | undefined) => string = (
    state,
  ) => {
    let queryState = ''
    if (state === 'ACTIVE') queryState = `AND urls.state = 'ACTIVE'`
    else if (state === 'INACTIVE') queryState = `AND urls.state = 'INACTIVE'`

    return queryState
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
  private getLongUrlFromDatabase: (shortUrl: string) => Promise<string> =
    async (shortUrl) => {
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
            return
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
  private cacheShortUrl: (shortUrl: string, longUrl: string) => Promise<void> =
    (shortUrl, longUrl) => {
      return new Promise((resolve, reject) => {
        redirectClient.set(shortUrl, longUrl, 'EX', redirectExpiry, (err) => {
          if (err) reject(err)
          else resolve()
        })
      })
    }

  /**
   * Generates the ranking algorithm to be used in the ORDER BY clause in the
   * SQL statement based on the input sort order.
   * @param  {SearchResultsSortOrder} order
   * @param  {string} urlTableName
   * @param  {string} urlClicksTableName
   * @returns The clause as a string.
   */
  private getRankingAlgorithm(
    order: SearchResultsSortOrder,
    urlTableName: string,
    urlClicksTableName: string,
  ): string {
    let rankingAlgorithm
    switch (order) {
      case SearchResultsSortOrder.Recency:
        rankingAlgorithm = `${urlTableName}."createdAt"`
        break
      case SearchResultsSortOrder.Popularity:
        rankingAlgorithm = `${urlClicksTableName}.clicks`
        break
      default:
        throw new Error(`Unsupported SearchResultsSortOrder: ${order}`)
    }
    return rankingAlgorithm
  }

  public bulkCreate: (properties: {
    userId: number
    urlMappings: BulkUrlMapping[]
  }) => Promise<void> = async (properties) => {
    const { urlMappings, userId } = properties
    await sequelize.transaction(async (t) => {
      const bulkUrlObjects = urlMappings.map(({ shortUrl, longUrl }) => {
        return {
          shortUrl,
          longUrl,
          userId,
          isFile: false,
          source: StorableUrlSource.Bulk,
        }
      })
      // sequelize model method
      await Url.bulkCreate(bulkUrlObjects, {
        transaction: t,
        individualHooks: false,
      })
    })
  }
}

export default UrlRepository
