import { inject, injectable } from 'inversify'
import { UserRepositoryInterface } from './interfaces/UserRepositoryInterface'
import { User, UserType } from '../models/user'
import {
  StorableUrl,
  StorableUser,
  UrlsPaginated,
  UserUrlsQueryConditions,
} from './types'
import { Mapper } from '../mappers/Mapper'
import { DependencyIds } from '../constants'
import { UrlType } from '../models/url'
import { NotFoundError } from '../util/error'

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
    return User.findOrCreate({ where: { email } }).then(([user, _]) => user)
  }

  public findOneUrlForUser: (
    userId: number,
    shortUrl: string,
  ) => Promise<StorableUrl | null> = async (userId, shortUrl) => {
    const user = await User.scope([
      { method: ['defaultScope'] },
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

  public findUserByUrl: (
    shortUrl: string,
  ) => Promise<StorableUser | null> = async (shortUrl) => {
    const user = await User.scope([
      { method: ['defaultScope'] },
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
    const userCountAndArray = await User.scope([
      { method: ['defaultScope'] },
      {
        method: ['urlsWithQueryConditions', conditions],
      },
    ]).findAndCountAll({
      subQuery: false, // set limit and offset at end of main query instead of subquery
    })

    if (!userCountAndArray) {
      throw new NotFoundError(notFoundMessage)
    }

    const { rows } = userCountAndArray
    let { count } = userCountAndArray
    const [userUrls] = rows

    if (!userUrls) {
      throw new NotFoundError(notFoundMessage)
    }

    const urls = userUrls.Urls.map((urlType) =>
      this.urlMapper.persistenceToDto(urlType),
    )

    // count will always be >= 1 due to left outer join on user and url tables
    // to handle edge case where count === 1 but user does not have any urls
    if (urls.length === 0) {
      count = 0
    }

    return { urls, count }
  }
}

export default UserRepository
