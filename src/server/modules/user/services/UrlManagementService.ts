import { inject, injectable } from 'inversify'
import { UserRepositoryInterface } from '../../../repositories/interfaces/UserRepositoryInterface'
import {
  StorableFile,
  StorableUrl,
  UrlsPaginated,
  UserUrlsQueryConditions,
} from '../../../repositories/types'
import dogstatsd, {
  SHORTLINK_CREATE,
  SHORTLINK_CREATE_TAG_IS_FILE,
} from '../../../util/dogstatsd'
import {
  AlreadyExistsError,
  AlreadyOwnLinkError,
  NotFoundError,
} from '../../../util/error'
import { UrlRepositoryInterface } from '../../../repositories/interfaces/UrlRepositoryInterface'
import { addFileExtension, getFileExtension } from '../../../util/fileFormat'
import { GoUploadedFile, UpdateUrlOptions } from '..'
import { DependencyIds } from '../../../constants'
import * as interfaces from '../interfaces'

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
    shortUrl: string,
    longUrl?: string,
    file?: GoUploadedFile,
    tags?: string[],
  ) => Promise<StorableUrl> = async (userId, shortUrl, longUrl, file, tags) => {
    const user = await this.userRepository.findById(userId)
    if (!user) {
      throw new NotFoundError('User not found')
    }

    const owner = await this.userRepository.findUserByUrl(shortUrl)
    if (owner) {
      throw new AlreadyExistsError(
        `Short link "${shortUrl}" is used. Click here to find out more`,
      )
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
      },
      storableFile,
    )
    dogstatsd.increment(SHORTLINK_CREATE, 1, 1, [
      `${SHORTLINK_CREATE_TAG_IS_FILE}:${!!file}`,
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
    shortUrl: string,
    longUrl?: string,
    tags?: string[],
  ) => Promise<StorableUrl> = async (userId, shortUrl, longUrl, tags) => {
    return this.urlRepository.bulkCreate({
      userId,
      longUrl,
      shortUrl,
      tags,
    })
  }
}

export default UrlManagementService
