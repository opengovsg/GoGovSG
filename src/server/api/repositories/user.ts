import { injectable } from 'inversify'
import { User } from '../../models/user'

export interface UserRepository {
  findOrCreateWithEmail(email: string): Promise<object>
}

@injectable()
/* eslint class-methods-use-this: ["error", { "exceptMethods":
  ["findOrCreateWithEmail"] }] */
export class UserRepositorySequelize implements UserRepository {
  async findOrCreateWithEmail(email: string): Promise<object> {
    return User.findOrCreate({ where: { email } }).then(([user, _]) => user.get())
  }
}
