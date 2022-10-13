/* eslint-disable class-methods-use-this, lines-between-class-members, no-dupe-class-members */

import { inject, injectable } from 'inversify'
import { Mapper } from './Mapper'
import { StorableUrl, StorableUser } from '../repositories/types'
import { UrlType } from '../models/url'
import { UserType } from '../models/user'
import { DependencyIds } from '../constants'

@injectable()
export class UserMapper implements Mapper<StorableUser, UserType> {
  private urlMapper: Mapper<StorableUrl, UrlType>

  public constructor(
    @inject(DependencyIds.urlMapper) urlMapper: Mapper<StorableUrl, UrlType>,
  ) {
    this.urlMapper = urlMapper
  }

  public persistenceToDto(userType: UserType): StorableUser
  public persistenceToDto(userType: UserType | null): StorableUser | null {
    if (!userType) {
      return null
    }
    return {
      id: userType.id,
      email: userType.email,
      urls: userType.Urls
        ? userType.Urls.map((url) => this.urlMapper.persistenceToDto(url))
        : undefined,
      hasApiKey: userType.apiKeyHash !== '',
    }
  }
}

export default UserMapper
