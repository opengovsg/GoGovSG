import Sequelize from 'sequelize'
import { sequelize } from '../util/sequelize'
import { IdType, Settable } from '../../types/server/models'
import { Url, UrlType } from './url'
import { emailValidator } from '../config'

// Users
export interface UserType extends IdType, Sequelize.Model {
  readonly email: string
  readonly apiKeyHash: string
  readonly Urls: UrlType[]
}

// For Sequelize.define
type UserTypeStatic = typeof Sequelize.Model & {
  new (values?: object, options?: Sequelize.BuildOptions): UserType
}

export const User = <UserTypeStatic>sequelize.define(
  'user',
  {
    email: {
      type: Sequelize.TEXT,
      unique: true,
      allowNull: false,
      validate: {
        isEmail: true,
        isLowercase: true,
        is: emailValidator.makeRe(),
      },
      set(this: Settable, email: string) {
        // must save email as lowercase
        this.setDataValue('email', email.trim().toLowerCase())
      },
    },
    apiKeyHash: {
      type: Sequelize.TEXT,
      unique: true,
      allowNull: true,
    },
  },
  {
    defaultScope: {
      useMaster: true,
    },
    scopes: {
      /**
       * Fetches a corresponding shortUrl that belongs to the user.
       * @param {string} shortUrl
       */
      includeShortUrl(shortUrl: string) {
        return {
          include: [
            {
              model: Url.scope(['defaultScope', 'getClicks']),
              as: 'Urls',
              where: { shortUrl },
            },
          ],
        }
      },
      /**
       * Use the replica database for read queries.
       */
      useReplica: {
        useMaster: undefined,
      },
    },
  },
)
