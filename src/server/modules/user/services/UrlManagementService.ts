import { inject, injectable } from 'inversify'
import { getSafeBrowsingExpiryDate } from '../../../util/safeBrowsing'
import { GoUploadedFile, UpdateUrlOptions } from '..'
import { apiLinkRandomStrLength } from '../../../config'
import { DependencyIds } from '../../../constants'
import { BULK } from '../../../models/types'
import { StorableUrlSource } from '../../../repositories/enums'
import { UrlRepositoryInterface } from '../../../repositories/interfaces/UrlRepositoryInterface'
import { UserRepositoryInterface } from '../../../repositories/interfaces/UserRepositoryInterface'
import {
  BulkUrlMapping,
  StorableFile,
  StorableUrl,
  UrlsPaginated,
  UserUrlsQueryConditions,
} from '../../../repositories/types'
import { Mailer } from '../../../services/email'
import dogstatsd, {
  SHORTLINK_CREATE,
  SHORTLINK_CREATE_TAG_IS_FILE,
  SHORTLINK_CREATE_TAG_SOURCE,
  SHORTLINK_TYPE_CONVERTED,
} from '../../../util/dogstatsd'
import {
  AlreadyExistsError,
  AlreadyOwnLinkError,
  NotFoundError,
} from '../../../util/error'
import { addFileExtension, getFileExtension } from '../../../util/fileFormat'
import generateShortUrl from '../../../util/url'
import * as interfaces from '../interfaces'

const API_LINK_RANDOM_STR_LENGTH = apiLinkRandomStrLength

@injectable()
export class UrlManagementService implements interfaces.UrlManagementService {
  private userRepository: UserRepositoryInterface

  private urlRepository: UrlRepositoryInterface

  private mailer: Mailer

  constructor(
    @inject(DependencyIds.userRepository)
    userRepository: UserRepositoryInterface,
    @inject(DependencyIds.urlRepository)
    urlRepository: UrlRepositoryInterface,
    @inject(DependencyIds.mailer) mailer: Mailer,
  ) {
    this.userRepository = userRepository
    this.urlRepository = urlRepository
    this.mailer = mailer
  }

  createUrl: (
    userId: number,
    source: StorableUrlSource.Console | StorableUrlSource.Api,
    shortUrl?: string,
    longUrl?: string,
    file?: GoUploadedFile,
    tags?: string[],
  ) => Promise<StorableUrl> = async (
    userId,
    source,
    originalShortUrl,
    longUrl,
    file,
    tags,
  ) => {
    const user = await this.userRepository.findById(userId)
    if (!user) {
      throw new NotFoundError('User not found.')
    }

    let shortUrl = originalShortUrl
    if (shortUrl === undefined) {
      if (source !== StorableUrlSource.Api) {
        throw new Error(
          'Short link can only be undefined for API created links.',
        )
      }
      shortUrl = await generateShortUrl(API_LINK_RANDOM_STR_LENGTH)
    }

    const isShortUrlAvailable = await this.urlRepository.isShortUrlAvailable(
      shortUrl,
    )
    if (!isShortUrlAvailable) {
      throw new AlreadyExistsError(`Short link "${shortUrl}" is already used.`)
    }

    const storableFile: StorableFile | undefined = file
      ? {
          data: file.data,
          key: addFileExtension(shortUrl, getFileExtension(file.name)),
          mimetype: file.mimetype,
        }
      : undefined

    const safeBrowsingExpiry = getSafeBrowsingExpiryDate({
      longUrl: longUrl || '',
    })

    // Success
    const result = await this.urlRepository.create(
      {
        userId: user.id,
        longUrl,
        shortUrl,
        tags,
        source,
        safeBrowsingExpiry: safeBrowsingExpiry.toISOString(),
      },
      storableFile,
    )
    dogstatsd.increment(SHORTLINK_CREATE, 1, 1, [
      `${SHORTLINK_CREATE_TAG_IS_FILE}:${!!file}`,
      `${SHORTLINK_CREATE_TAG_SOURCE}:${source}`,
    ])

    return result
  }

  updateUrl: (
    userId: number,
    shortUrl: string,
    options: UpdateUrlOptions,
  ) => Promise<StorableUrl> = async (userId, shortUrl, options) => {
    const { state, longUrl, file, description, contactEmail, tags } = options

    const url = await this.userRepository.findOneUrlForUser(userId, shortUrl)

    if (!url) {
      throw new NotFoundError(`Short link "${shortUrl}" not found for user.`)
    }

    const wasFile = url.isFile
    let isFile: boolean | undefined
    if (file) {
      isFile = true
    } else if (longUrl !== undefined) {
      isFile = false
    }
    const typeChanged = isFile !== undefined && isFile !== wasFile

    const storableFile: StorableFile | undefined = file
      ? {
          data: file.data,
          key: addFileExtension(shortUrl, getFileExtension(file.name)),
          mimetype: file.mimetype,
        }
      : undefined

    // NOTE: We only update the safeBrowsingExpiry if longUrl is provided, which
    // means that the longUrl was able to be scanned for threats.
    // The longUrl can be undefined when editing other fields, or even changing
    // the short link from INACTIVE to ACTIVE.
    const safeBrowsingExpiry = longUrl
      ? getSafeBrowsingExpiryDate({
          longUrl,
        }).toISOString()
      : undefined

    const result = await this.urlRepository.update(
      url,
      {
        longUrl,
        state,
        description,
        contactEmail,
        tags,
        safeBrowsingExpiry,
        ...(typeChanged && isFile !== undefined ? { isFile } : {}),
      },
      storableFile,
    )

    if (typeChanged) {
      dogstatsd.increment(SHORTLINK_TYPE_CONVERTED, 1, 1, [
        `direction:${wasFile ? 'file_to_link' : 'link_to_file'}`,
      ])
    }

    return result
  }

  changeOwnership: (
    userId: number,
    shortUrl: string,
    newUserEmail: string,
  ) => Promise<StorableUrl> = async (userId, shortUrl, newUserEmail) => {
    // Test current user really owns the shortlink
    const url = await this.userRepository.findOneUrlForUser(userId, shortUrl)

    if (!url) {
      throw new NotFoundError(`Short link "${shortUrl}" not found for user.`)
    }

    // Check that the new user exists
    const newUser = await this.userRepository.findByEmail(
      newUserEmail.toLowerCase(),
    )

    if (!newUser) {
      throw new NotFoundError('User not found.')
    }
    const newUserId = newUser.id

    // Do nothing if it is the same user
    if (userId === newUserId) {
      throw new AlreadyOwnLinkError('You already own this link.')
    }

    // Success
    return this.urlRepository.update(url, {
      userId: newUserId,
    })
  }

  getUrlsWithConditions: (
    conditions: UserUrlsQueryConditions,
  ) => Promise<UrlsPaginated> = (conditions) => {
    return this.userRepository.findUrlsForUser(conditions)
  }

  bulkCreate: (
    userId: number,
    urlMappings: BulkUrlMapping[],
    tags?: string[],
  ) => Promise<void> = async (userId, urlMappings, tags) => {
    await this.urlRepository.bulkCreate({
      userId,
      urlMappings,
      tags,
    })
    dogstatsd.increment(SHORTLINK_CREATE, urlMappings.length, 1, [
      `${SHORTLINK_CREATE_TAG_IS_FILE}:false`,
      `${SHORTLINK_CREATE_TAG_SOURCE}:${BULK}`,
    ])
  }

  deactivateMaliciousShortUrl: (shortUrl: string) => Promise<void> = async (
    shortUrl,
  ) => {
    await this.urlRepository.deactivateShortUrl(shortUrl)
    const user = await this.userRepository.findUserByUrl(shortUrl)
    if (!user) {
      throw new NotFoundError(`User not found for short link "${shortUrl}".`)
    }

    // Send email to user notifying them of the deactivation
    await this.mailer.mailDeactivatedMaliciousShortUrl(user.email, shortUrl)
  }
}

export default UrlManagementService
