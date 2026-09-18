import Sequelize from 'sequelize'
import { sequelize } from '../util/sequelize.js'
import { IdType, Settable } from '../../types/server/models/index.js'
import { Url, UrlType } from './url.js'
import { emailValidator } from '../config.js'

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
      allowNull: true,
      validate: {
        isEmail: true,
        isLowercase: true,
        is: {
          args: emailValidator.makeRe() as RegExp,
          msg: 'Email domain is not whitelisted.',
        },
      },
      set(this: Settable, email: string) {
        // must save email as lowercase
        this.setDataValue('email', email.trim().toLowerCase())
      },
    },
    apiKeyHash: {
      type: Sequelize.TEXT,
      allowNull: true,
    },
  },
  {
    indexes: [
      {
        unique: true,
        fields: ['apiKeyHash'],
        name: 'users_api_key_hash',
      },
    ],
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
