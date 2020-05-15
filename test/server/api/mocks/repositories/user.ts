/* eslint-disable max-classes-per-file, class-methods-use-this */
import { injectable } from 'inversify'
import { UserRepository } from '../../../../../src/server/api/repositories/user'

@injectable()
export class UserRepositoryMock implements UserRepository {
  findOrCreateWithEmail(_: string): Promise<object> {
    return Promise.resolve({})
  }
}

@injectable()
export class UserRepositoryMockFail implements UserRepository {
  findOrCreateWithEmail(email: string): Promise<object> {
    return Promise.reject(Error('Database is down'))
  }
}
