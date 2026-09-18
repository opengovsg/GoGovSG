/* eslint-disable class-methods-use-this, no-dupe-class-members */

import { inject, injectable } from 'inversify'
import { Mapper } from './Mapper.js'
import { StorableUrl, StorableUser } from '../repositories/types.js'
import { UrlType } from '../models/url.js'
import { UserType } from '../models/user.js'
import { DependencyIds } from '../constants.js'

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
    }
  }
}

export default UserMapper
