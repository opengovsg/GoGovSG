import { inject, injectable } from 'inversify'
import { UrlManagementServiceInterface } from './interfaces/UrlManagementServiceInterface'
import { UpdateUrlOptions } from './types'
import { UserRepositoryInterface } from '../repositories/interfaces/UserRepositoryInterface'
import {
  StorableFile,
  StorableUrl,
  UrlsPaginated,
  UserUrlsQueryConditions,
} from '../repositories/types'
import {
  AlreadyExistsError,
  AlreadyOwnLinkError,
  NotFoundError,
} from '../util/error'
import { UrlRepositoryInterface } from '../repositories/interfaces/UrlRepositoryInterface'
import { addFileExtension, getFileExtension } from '../util/fileFormat'
import { GoUploadedFile } from '../controllers/types'
import { DependencyIds } from '../constants'

@injectable()
export class UrlManagementService implements UrlManagementServiceInterface {
  private userRepository: UserRepositoryInterface

  private urlRepository: UrlRepositoryInterface

  constructor(
    @inject(DependencyIds.userRepository)
    userRepository: UserRepositoryInterface,
    @inject(DependencyIds.urlRepository) urlRepository: UrlRepositoryInterface,
  ) {
    this.userRepository = userRepository
    this.urlRepository = urlRepository
  }

  createUrl: (
    userId: number,
    shortUrl: string,
    longUrl?: string,
    file?: GoUploadedFile,
  ) => Promise<StorableUrl> = async (userId, shortUrl, longUrl, file) => {
    const user = await this.userRepository.findById(userId)

    if (!user) {
      throw new NotFoundError('User not found')
    }

    const existsShortUrl = await this.urlRepository.findByShortUrl(shortUrl)
    if (existsShortUrl) {
      const owner = await this.userRepository.findUserByUrl(shortUrl)
      throw new AlreadyExistsError(
        `Short link "${shortUrl}" is owned by ${owner?.email}`,
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
      },
      storableFile,
    )

    return result
  }

  updateUrl: (
    userId: number,
    shortUrl: string,
    options: UpdateUrlOptions,
  ) => Promise<StorableUrl> = async (userId, shortUrl, options) => {
    const {
      state,
      longUrl,
      file,
      isSearchable,
      description,
      contactEmail,
    } = options

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
      { longUrl, state, isSearchable, description, contactEmail },
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
    const result = await this.urlRepository.update(url, {
      userId: newUserId,
    })

    return result
  }

  getUrlsWithConditions: (
    conditions: UserUrlsQueryConditions,
  ) => Promise<UrlsPaginated> = (conditions) => {
    return this.userRepository.findUrlsForUser(conditions)
  }
}

export default UrlManagementService
