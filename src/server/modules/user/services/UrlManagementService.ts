import { inject, injectable } from 'inversify'
import { apiLinkRandomStrLength } from '../../../config'
import { UserRepositoryInterface } from '../../../repositories/interfaces/UserRepositoryInterface'
import {
  BulkUrlMapping,
  StorableFile,
  StorableUrl,
  UrlsPaginated,
  UserUrlsQueryConditions,
} from '../../../repositories/types'
import dogstatsd, {
  SHORTLINK_CREATE,
  SHORTLINK_CREATE_TAG_IS_FILE,
  SHORTLINK_CREATE_TAG_SOURCE,
} from '../../../util/dogstatsd'
import {
  AlreadyExistsError,
  AlreadyOwnLinkError,
  InvalidUrlUpdateError,
  NotFoundError,
} from '../../../util/error'
import { StorableUrlSource } from '../../../repositories/enums'
import { UrlRepositoryInterface } from '../../../repositories/interfaces/UrlRepositoryInterface'
import { addFileExtension, getFileExtension } from '../../../util/fileFormat'
import generateShortUrl from '../../../util/url'
import { GoUploadedFile, UpdateUrlOptions } from '..'
import { DependencyIds } from '../../../constants'
import { BULK } from '../../../models/types'
import * as interfaces from '../interfaces'

const API_LINK_RANDOM_STR_LENGTH = apiLinkRandomStrLength

@injectable()
export class UrlManagementService implements interfaces.UrlManagementService {
  private userRepository: UserRepositoryInterface

  private urlRepository: UrlRepositoryInterface

  constructor(
    @inject(DependencyIds.userRepository)
    userRepository: UserRepositoryInterface,
    @inject(DependencyIds.urlRepository)
    urlRepository: UrlRepositoryInterface,
  ) {
    this.userRepository = userRepository
    this.urlRepository = urlRepository
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

    const owner = await this.userRepository.findUserByUrl(shortUrl)
    if (owner) {
      throw new AlreadyExistsError(`Short link "${shortUrl}" is already used.`)
    }

    const storableFile: StorableFile | undefined = file
      ? {
          data: file.data,
          key: addFileExtension(shortUrl, getFileExtension(file.name)),
          mimetype: file.mimetype,
        }
      : undefined

    // Success
    const result = await this.urlRepository.create(
      {
        userId: user.id,
        longUrl,
        shortUrl,
        tags,
        source,
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
    } else if (url.isFile && options.longUrl) {
      throw new InvalidUrlUpdateError(`Cannot update longUrl for file.`)
    } else if (!url.isFile && options.file) {
      throw new InvalidUrlUpdateError(`Cannot update file for link.`)
    }

    const storableFile: StorableFile | undefined = file
      ? {
          data: file.data,
          key: addFileExtension(shortUrl, getFileExtension(file.name)),
          mimetype: file.mimetype,
        }
      : undefined

    return this.urlRepository.update(
      url,
      { longUrl, state, description, contactEmail, tags },
      storableFile,
    )
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
}

export default UrlManagementService
