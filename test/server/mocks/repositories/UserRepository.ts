/* eslint-disable class-methods-use-this */

import { injectable } from 'inversify'

import { UserRepositoryInterface } from '../../../../src/server/repositories/interfaces/UserRepositoryInterface'
import {
  StorableUrl,
  StorableUser,
  UrlsPaginated,
  UserUrlsQueryConditions,
} from '../../../../src/server/repositories/types'

@injectable()
export class MockUserRepository implements UserRepositoryInterface {
  userId?: number

  email?: string

  shortUrl?: string

  conditions?: UserUrlsQueryConditions

  findById(userId: number): Promise<StorableUser | null> {
    this.userId = userId
    return Promise.resolve(null)
  }

  findByEmail(email: string): Promise<StorableUser | null> {
    this.email = email
    return Promise.resolve(null)
  }

  findOrCreateWithEmail(email: string): Promise<StorableUser> {
    this.email = email
    return Promise.resolve({
      email: 'test@hello.gov.sg',
      urls: [],
      id: 1,
    } as StorableUser)
  }

  findOneUrlForUser(
    userId: number,
    shortUrl: string,
  ): Promise<StorableUrl | null> {
    this.userId = userId
    this.shortUrl = shortUrl
    return Promise.resolve({
      shortUrl,
      longUrl: 'https://open.gov.sg',
      state: 'ACTIVE',
      clicks: 100,
      isFile: false,
      createdAt: '',
      updatedAt: '',
    } as StorableUrl)
  }

  findUrlsForUser(conditions: UserUrlsQueryConditions): Promise<UrlsPaginated> {
    this.conditions = conditions
    return Promise.resolve({ count: 0, urls: [] })
  }
}

export default MockUserRepository
