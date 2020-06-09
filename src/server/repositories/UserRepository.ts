import { inject, injectable } from 'inversify'
import { UserRepositoryInterface } from './interfaces/UserRepositoryInterface'
import { User, UserType } from '../models/user'
import { StorableUrl, StorableUser, UserUrlsQueryConditions } from './types'
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
    return User.findOrCreate({ where: { email } }).then(([user, _]) =>
      user.get(),
    )
  }

  public findOneUrlForUser: (
    userId: number,
    shortUrl: string,
  ) => Promise<StorableUrl | null> = async (userId, shortUrl) => {
    const user = await User.scope({
      method: ['includeShortUrl', shortUrl],
    }).findOne({
      where: { id: userId },
    })

    if (!user) {
      return null
    }

    const {
      Urls: [url],
    } = user.get() as UserType

    return this.urlMapper.persistenceToDto(url)
  }

  public findUrlsForUser: (
    conditions: UserUrlsQueryConditions,
  ) => Promise<StorableUrl[]> = async (conditions) => {
    const notFoundMessage = 'Urls not found'
    const userCountAndArray = await User.scope({
      method: ['urlsWithQueryConditions', conditions],
    }).findAndCountAll({
      subQuery: false, // set limit and offset at end of main query instead of subquery
    })

    if (!userCountAndArray) {
      throw new NotFoundError(notFoundMessage)
    }

    const { rows } = userCountAndArray
    const [userUrls] = rows

    if (!userUrls) {
      throw new NotFoundError(notFoundMessage)
    }

    const urls = (userUrls.get() as UserType).Urls.map((urlType) =>
      this.urlMapper.persistenceToDto(urlType),
    )

    return urls
  }

  public getNumUsers: () => Promise<number> = () => {
    return User.count()
  }
}

export default UserRepository
