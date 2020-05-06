import Sequelize from 'sequelize'
import { parse } from 'url'
import { ACTIVE, INACTIVE } from './types'
import blacklist from '../resources/blacklist'
import { isHttps } from '../../shared/util/validation'
import {
  databaseUri,
  emailValidator,
  logger,
  ogHostname,
} from '../config'

// Sequelize handle to database
export const sequelize = new Sequelize.Sequelize(databaseUri, {
  dialect: 'postgres',
  timezone: '+08:00',
  logging: logger.info.bind(logger),
})

// Circumvent issues with typescript not knowing about `this`
// variable during compile time. For use in setters in model
// definition.
interface Settable {
  setDataValue(key: string, value: any): void
}

// Common types
interface IdType { readonly id: number }

// URLs
interface UrlBaseType extends IdType {
  readonly shortUrl: string
  readonly longUrl: string
  readonly state: Sequelize.EnumDataType<string>
  readonly isFile: boolean
}

interface UrlType extends IdType, UrlBaseType, Sequelize.Model {
  readonly clicks: Sequelize.IntegerDataType
}

// For Sequelize.define
type UrlTypeStatic = typeof Sequelize.Model & {
  new(values?: object, options?: Sequelize.BuildOptions): UrlType
}

export const Url = <UrlTypeStatic>sequelize.define('url', {
  shortUrl: {
    type: Sequelize.STRING,
    primaryKey: true,
    validate: {
      is: /^[a-z0-9-]+$/,
    },
  },
  longUrl: {
    type: Sequelize.TEXT, // Support >255 chars
    validate: {
      isUrl: true,

      httpsCheck(url: string) { // Must be https
        if (!isHttps(url)) throw new Error('Only HTTPS URLs are allowed.')
      },

      noCircularRedirects(url: string) {
        if (parse(url).hostname === ogHostname) {
          throw new Error('Circular redirects to go.gov.sg are prohibited')
        }
      },

      // Blacklist check
      blacklistCheck(longUrl: string) {
        if (blacklist.some((bl) => longUrl.includes(bl))) {
          throw new Error(
            'Database creation of URLs to link shortener sites prohibited.',
          )
        }
      },
    },
    allowNull: false,
  },
  state: {
    type: Sequelize.ENUM,
    values: [ACTIVE, INACTIVE],
    defaultValue: ACTIVE,
  },
  clicks: {
    type: Sequelize.INTEGER,
    allowNull: false,
    defaultValue: 0,
  },
  isFile: {
    type: Sequelize.BOOLEAN,
    allowNull: true, // TODO: Make this false after backfill.
  },
}, {
  hooks: {
    afterCreate: async (url: UrlType, options) => {
      if (!options.transaction) {
        return Promise.reject(new Error('URL creation must be wrapped in a transaction'))
      }
      // eslint-disable-next-line no-use-before-define
      await writeToUrlHistory(
        url,
        options as Sequelize.CreateOptions & { transaction: Sequelize.Transaction },
      )
      return Promise.resolve()
    },
    // Note: This hook does not fire during url.increment('clicks'), as
    // increment() is implemented as an in-database atomic operation which
    // bypasses the model instance on the server.
    afterUpdate: async (url: UrlType, options) => {
      if (!options.transaction) {
        return Promise.reject(new Error('URL updates must be wrapped in a transaction'))
      }
      // eslint-disable-next-line no-use-before-define
      await writeToUrlHistory(
        url,
        options as Sequelize.InstanceUpdateOptions & { transaction: Sequelize.Transaction },
      )
      return Promise.resolve()
    },
    beforeBulkUpdate: () => Promise.reject(new Error('Bulk updates are not allowed: please edit URLs individually instead.')),
  },
  indexes: [
    {
      unique: false,
      fields: ['userId'],
    },
  ],
})

// Users
export interface UserType extends IdType, Sequelize.Model {
  readonly email: string
  readonly Urls: UrlType[]
}

// For Sequelize.define
type UserTypeStatic = typeof Sequelize.Model & {
  new(values?: object, options?: Sequelize.BuildOptions): UserType
}

export const User = <UserTypeStatic>sequelize.define('user', {
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
      limit: number,
      offset: number,
      orderBy: string,
      sortDirection: string,
      searchText: string,
      userId: number }) {
      const {
        limit, offset, orderBy, sortDirection, userId, searchText,
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
})

// One user can create many urls but each url can only be mapped to one user.
User.hasMany(Url, { as: 'Urls', foreignKey: { allowNull: false } })
Url.belongsTo(User, { foreignKey: { allowNull: false } })

/**
 * History of URL record changes.
 * Logs the creation and modification of shorturls.
 * ShortUrl is not included as it is the foreign key.
 */
interface UrlHistoryType extends IdType, UrlBaseType, Sequelize.Model { }

type UrlHistoryStatic = typeof Sequelize.Model & {
  new(values?: object, options?: Sequelize.BuildOptions): UrlHistoryType
}

const UrlHistory = <UrlHistoryStatic>sequelize.define('url_history', {
  longUrl: {
    type: Sequelize.TEXT,
    allowNull: false,
  },
  // UrlHistory table relies on `enum_urls_state` enum type for the `state`
  // column, which is created by Url table, so this table must be defined
  // after `Url` table.
  state: {
    type: 'enum_urls_state',
    allowNull: false,
  },
  isFile: {
    type: Sequelize.BOOLEAN,
    allowNull: true, // TODO: Make this false after backfill.
  },
})

// A Url record can have many updates by many users
Url.hasMany(UrlHistory, { foreignKey: { allowNull: false } })
UrlHistory.belongsTo(Url, { foreignKey: { allowNull: false } })
User.hasMany(UrlHistory, { foreignKey: { allowNull: false } })
UrlHistory.belongsTo(User, { foreignKey: { allowNull: false } })

/**
 * Helper function to take a Url instance object and writes to the UrlHistory table.
 */
const writeToUrlHistory = async (
  url: UrlType,
  options: Sequelize.Options & { transaction: Sequelize.Transaction },
): Promise<UrlHistoryType> => {
  const urlObj = url.toJSON() as UrlType & { userId: Number }

  return UrlHistory.create({
    userId: urlObj.userId,
    state: urlObj.state,
    urlShortUrl: urlObj.shortUrl,
    longUrl: urlObj.longUrl,
    isFile: urlObj.isFile,
  }, {
    transaction: options.transaction,
  })
}

/**
 * Initialise the database table.
 */
export const initDb = async () => {
  await sequelize.sync()
}
