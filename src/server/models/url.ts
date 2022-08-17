import Sequelize from 'sequelize'
import { UrlClicks, UrlClicksType } from './statistics/clicks'
import { ACTIVE, INACTIVE } from './types'
import {
  SHORT_URL_REGEX,
  isBlacklisted,
  isCircularRedirects,
  isHttps,
  isValidUrl,
} from '../../shared/util/validation'
import { sequelize } from '../util/sequelize'
import { IdType } from '../../types/server/models'
import { DEV_ENV, emailValidator, ogHostname } from '../config'
import { StorableUrlState } from '../repositories/enums'
import { urlSearchVector } from './search'
import { Tag, TagType } from './tag'

export interface UrlBaseType extends IdType {
  readonly shortUrl: string
  readonly longUrl: string
  readonly state: StorableUrlState
  readonly isFile: boolean
  readonly contactEmail: string | null
  readonly description: string
}

export interface UrlType extends IdType, UrlBaseType, Sequelize.Model {
  readonly UrlClicks?: UrlClicksType
  tags?: TagType[]
  readonly createdAt: string
  readonly updatedAt: string
  readonly email: string
}

// For sequelize define
type UrlTypeStatic = typeof Sequelize.Model & {
  new (values?: object, options?: Sequelize.BuildOptions): UrlType
}

/**
 * History of URL record changes.
 * Logs the creation and modification of shorturls.
 * ShortUrl is not included as it is the foreign key.
 */
export interface UrlHistoryType extends IdType, UrlBaseType, Sequelize.Model {
  readonly createdAt: string
  readonly updatedAt: string
  readonly urlShortUrl: string
  readonly userId: Number
}

type UrlHistoryStatic = typeof Sequelize.Model & {
  new (values?: object, options?: Sequelize.BuildOptions): UrlHistoryType
}

export const UrlHistory = <UrlHistoryStatic>sequelize.define('url_history', {
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
    allowNull: false,
  },
  contactEmail: {
    type: Sequelize.TEXT,
    allowNull: true,
  },
  description: {
    type: Sequelize.TEXT,
    allowNull: false,
    defaultValue: '',
  },
})

/**
 * Helper function to take a Url instance object and writes to the UrlHistory table.
 */
const writeToUrlHistory = async (
  url: UrlType,
  options: Sequelize.CreateOptions & { transaction: Sequelize.Transaction },
): Promise<UrlHistoryType> => {
  const urlObj = url.toJSON() as UrlType & { userId: Number }

  return UrlHistory.create(
    {
      userId: urlObj.userId,
      state: urlObj.state,
      urlShortUrl: urlObj.shortUrl,
      longUrl: urlObj.longUrl,
      isFile: urlObj.isFile,
      contactEmail: urlObj.contactEmail,
      description: urlObj.description,
    },
    {
      transaction: options.transaction,
    },
  )
}

export const Url = <UrlTypeStatic>sequelize.define(
  'url',
  {
    shortUrl: {
      type: Sequelize.STRING,
      primaryKey: true,
      validate: {
        is: SHORT_URL_REGEX,
      },
    },
    longUrl: {
      type: Sequelize.TEXT, // Support >255 chars
      validate: {
        urlCheck(url: string) {
          if (!isValidUrl(url, DEV_ENV)) {
            throw new Error('Invalid URLs are not allowed.')
          }
        },

        httpsCheck(url: string) {
          if (!isHttps(url, DEV_ENV)) {
            throw new Error('Only HTTPS URLs are allowed.')
          }
        },

        noCircularRedirects(url: string) {
          if (isCircularRedirects(url, ogHostname)) {
            throw new Error('Circular redirects to go.gov.sg are prohibited')
          }
        },

        // Blacklist check
        blacklistCheck(longUrl: string) {
          if (isBlacklisted(longUrl)) {
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
    isFile: {
      type: Sequelize.BOOLEAN,
      allowNull: false,
    },
    contactEmail: {
      type: Sequelize.TEXT,
      allowNull: true,
      validate: {
        isEmail: true,
        isLowercase: true,
        is: emailValidator.makeRe(),
      },
    },
    description: {
      type: Sequelize.TEXT,
      allowNull: false,
      defaultValue: '',
    },
  },
  {
    hooks: {
      afterCreate: async (url: UrlType, options) => {
        if (!options.transaction) {
          return Promise.reject(
            new Error('URL creation must be wrapped in a transaction'),
          )
        }
        // eslint-disable-next-line no-use-before-define
        await writeToUrlHistory(
          url,
          options as Sequelize.CreateOptions & {
            transaction: Sequelize.Transaction
          },
        )

        await UrlClicks.create(
          {
            shortUrl: url.shortUrl,
            clicks: 0,
          },
          options,
        )
        return Promise.resolve()
      },
      // Note: This hook does not fire during url.increment('clicks'), as
      // increment() is implemented as an in-database atomic operation which
      // bypasses the model instance on the server.
      afterUpdate: async (url: UrlType, options) => {
        if (!options.transaction) {
          return Promise.reject(
            new Error('URL updates must be wrapped in a transaction'),
          )
        }
        // eslint-disable-next-line no-use-before-define
        await writeToUrlHistory(
          url,
          options as Sequelize.InstanceUpdateOptions & {
            transaction: Sequelize.Transaction
          },
        )
        return Promise.resolve()
      },
      beforeBulkUpdate: () =>
        Promise.reject(
          new Error(
            'Bulk updates are not allowed: please edit URLs individually instead.',
          ),
        ),
    },
    indexes: [
      {
        unique: false,
        fields: ['userId'],
      },
      {
        name: 'urls_combined_weighted_search_idx',
        unique: false,
        using: 'GIN',
        fields: [Sequelize.literal(`(${urlSearchVector})`)],
      },
    ],
    defaultScope: {
      useMaster: true,
    },
    scopes: {
      getClicks: {
        include: [
          {
            model: UrlClicks,
            as: 'UrlClicks',
          },
        ],
      },
      getTags: {
        include: [
          {
            model: Tag,
            as: 'tags',
          },
        ],
      },
      /**
       * Use the replica database for read queries. To be enabled
       * when realtime data is not needed.
       */
      useReplica: {
        useMaster: undefined,
      },
    },
  },
)

// An Url record can have many updates
Url.hasMany(UrlHistory, { foreignKey: { allowNull: false } })
UrlHistory.belongsTo(Url, { foreignKey: { allowNull: false } })
