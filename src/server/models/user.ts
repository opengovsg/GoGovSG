import Sequelize from 'sequelize'
import { sequelize } from '../util/sequelize'
import { IdType, Settable } from '../../types/server/models'
import { Url, UrlType } from './url'
import { emailValidator } from '../config'

// Users
export interface UserType extends IdType, Sequelize.Model {
  readonly email: string
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
  },
  {
    scopes: {
      /**
       * Fetches all Urls with the given settings.
       * @param {Object} queryConditions
       * @property {number} limit - Number of rows per page.
       * @property {number} offset - (curr page number - 1) * limit.
       * @property {string} orderBy - Column name.
       * @property {string} sortDirection - ASC/DESC.
       * @property {string} searchText - User's search input.
       * @property {number} userId - UserId of requester.
       */
      urlsWithQueryConditions(queryConditions: {
        limit: number
        offset: number
        orderBy: string
        sortDirection: string
        searchText: string
        userId: number
      }) {
        const {
          limit,
          offset,
          orderBy,
          sortDirection,
          userId,
          searchText,
        } = queryConditions
        const { Op } = Sequelize

        return {
          include: [
            {
              model: Url,
              as: 'Urls',
              where: {
                [Op.or]: [
                  {
                    shortUrl: {
                      [Op.substring]: searchText,
                    },
                  },
                  {
                    longUrl: {
                      [Op.substring]: searchText,
                    },
                  },
                ],
              },
              // use left outer join instead of default inner join
              required: false,
              right: false,
            },
          ],
          order: [[{ model: Url, as: 'Urls' }, orderBy, sortDirection]],
          where: {
            id: userId,
          },
          offset,
          limit,
        }
      },
      /**
       * Fetches a corresponding shortUrl that belongs to the user.
       * @param {string} shortUrl
       */
      includeShortUrl(shortUrl: string) {
        return {
          include: [
            {
              model: Url,
              as: 'Urls',
              where: { shortUrl },
            },
          ],
        }
      },
    },
  },
)
