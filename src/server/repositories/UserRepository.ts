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
import { Tag } from '../models/tag'
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
    const { whereConditions, includeConditions } =
      UserRepository.buildQueryConditions(conditions)
    const urlsAndCount = await Url.scope([
      'defaultScope',
      'getClicks',
    ]).findAndCountAll({
      where: whereConditions,
      distinct: true,
      limit: conditions.limit,
      offset: conditions.offset,
      order: [
        [
          { model: UrlClicks, as: 'UrlClicks' },
          conditions.orderBy,
          conditions.sortDirection,
        ],
      ],
      include: [includeConditions],
    })
    if (!urlsAndCount) {
      throw new NotFoundError(notFoundMessage)
    }
    let { rows } = urlsAndCount
    let { count } = urlsAndCount
    if (!rows || count === 0) {
      throw new NotFoundError(notFoundMessage)
    }
    if (conditions.tags && conditions.tags.length > 0) {
      // Perform a second DB read to retrieve all tags
      const shortUrls = rows.map((urlType) => {
        return urlType.shortUrl
      })
      rows = await Url.scope()
        .scope(['defaultScope', 'getClicks', 'getTags'])
        .findAll({
          where: { shortUrl: shortUrls },
        })
    }

    const urls = rows.map((urlType) => this.urlMapper.persistenceToDto(urlType))
    if (urls.length === 0) {
      count = 0
    }
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
    const whereConditions: any =
      conditions.searchText.length > 0
        ? {
            ...searchTextCondition,
            userId: conditions.userId,
          }
        : { userId: conditions.userId }
    if (conditions.state) {
      whereConditions.state = conditions.state
    }
    if (conditions.isFile !== undefined) {
      whereConditions.isFile = conditions.isFile
    }
    const includeConditions: any = {
      model: Tag,
    }
    if (conditions.tags && conditions.tags.length > 0) {
      includeConditions.where = {
        [Op.or]: conditions.tags.map((tag) => {
          return { tagKey: { [Op.substring]: `${tag}` } }
        }),
      }
    }
    return { whereConditions, includeConditions }
  }
}

export default UserRepository
