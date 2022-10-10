import { inject, injectable } from 'inversify'
import { Op } from 'sequelize'
import {
  StorableUrl,
  StorableUser,
  UrlsPaginated,
  UserUrlsQueryConditions,
} from './types'
import { UserRepositoryInterface } from './interfaces/UserRepositoryInterface'
import { User, UserType } from '../models/user'
import { Mapper } from '../mappers/Mapper'
import { DependencyIds } from '../constants'
import { Url, UrlType } from '../models/url'
import dogstatsd, { USER_NEW } from '../util/dogstatsd'
import { NotFoundError } from '../util/error'
import { UrlClicks } from '../models/statistics/clicks'

/**
 * A user repository that handles access to the data store of Users.
 * The following implementation uses Sequelize.
 */
@injectable()
export class UserRepository implements UserRepositoryInterface {
  private userMapper: Mapper<StorableUser, UserType>

  private urlMapper: Mapper<StorableUrl, UrlType>

  public constructor(
    @inject(DependencyIds.userMapper)
    userMapper: Mapper<StorableUser, UserType>,
    @inject(DependencyIds.urlMapper)
    urlMapper: Mapper<StorableUrl, UrlType>,
  ) {
    this.userMapper = userMapper
    this.urlMapper = urlMapper
  }

  public findUserByApiKey: (
    apiKeyHash: string,
  ) => Promise<StorableUser | null> = async (apiKeyHash: string) => {
    return this.userMapper.persistenceToDto(
      await User.findOne({ where: { apiKeyHash } }),
    )
  }

  public findById: (userId: number) => Promise<StorableUser | null> = async (
    userId,
  ) => {
    return this.userMapper.persistenceToDto(await User.findByPk(userId))
  }

  public findByEmail: (email: string) => Promise<StorableUser | null> = async (
    email,
  ) => {
    return this.userMapper.persistenceToDto(
      await User.findOne({ where: { email } }),
    )
  }

  public findOrCreateWithEmail: (email: string) => Promise<StorableUser> = (
    email,
  ) => {
    return User.findOrCreate({ where: { email } }).then(([user, created]) => {
      if (created) {
        dogstatsd.increment(USER_NEW, 1, 1)
      }
      return user
    })
  }

  public findOneUrlForUser: (
    userId: number,
    shortUrl: string,
  ) => Promise<StorableUrl | null> = async (userId, shortUrl) => {
    const user = await User.scope([
      'defaultScope',
      {
        method: ['includeShortUrl', shortUrl],
      },
    ]).findOne({
      where: { id: userId },
    })

    if (!user) {
      return null
    }

    const [url] = user.Urls

    return this.urlMapper.persistenceToDto(url)
  }

  public findUserByUrl: (shortUrl: string) => Promise<StorableUser | null> =
    async (shortUrl) => {
      const user = await User.scope([
        'defaultScope',
        {
          method: ['includeShortUrl', shortUrl],
        },
      ]).findOne()

      return this.userMapper.persistenceToDto(user)
    }

  public findUrlsForUser: (
    conditions: UserUrlsQueryConditions,
  ) => Promise<UrlsPaginated> = async (conditions) => {
    const notFoundMessage = 'Urls not found'
    const whereConditions = UserRepository.buildQueryConditions(conditions)
    const urlsAndCount = await Url.scope([
      'defaultScope',
      'getClicks',
    ]).findAndCountAll({
      where: whereConditions,
      limit: conditions.limit,
      offset: conditions.offset,
      order: [
        [
          { model: UrlClicks, as: 'UrlClicks' },
          conditions.orderBy,
          conditions.sortDirection,
        ],
      ],
    })
    if (!urlsAndCount) {
      throw new NotFoundError(notFoundMessage)
    }
    const { rows, count } = urlsAndCount
    const urls = rows.map((urlType) => this.urlMapper.persistenceToDto(urlType))
    return { urls, count }
  }

  private static buildQueryConditions(conditions: UserUrlsQueryConditions) {
    const searchTextCondition = {
      [Op.or]: [
        {
          shortUrl: {
            [Op.substring]: conditions.searchText,
          },
        },
        {
          longUrl: {
            [Op.substring]: conditions.searchText,
          },
        },
      ],
    }
    let whereConditions: any = { userId: conditions.userId }
    if (conditions.searchText.length > 0) {
      whereConditions = { ...whereConditions, ...searchTextCondition }
    }

    if (conditions.tags && conditions.tags.length > 0) {
      const searchTagConditions = {
        [Op.or]: conditions.tags.map((tag) => {
          return { tagStrings: { [Op.iLike]: `%${tag}%` } }
        }),
      }
      whereConditions = { ...whereConditions, ...searchTagConditions }
    }
    if (conditions.state) {
      whereConditions.state = conditions.state
    }
    if (conditions.isFile !== undefined) {
      whereConditions.isFile = conditions.isFile
    }
    return whereConditions
  }

  public saveApiKeyHash: (userId: number, apiKeyHash: string) => Promise<void> =
    async (userId, apiKeyHash) => {
      const user = await User.findOne({
        where: { id: userId },
      })
      if (!user) {
        throw new NotFoundError('User not found')
      }
      await user.update({
        apiKeyHash,
      })
    }
}

export default UserRepository
