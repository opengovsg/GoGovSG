import Sequelize from 'sequelize'
import { sequelize } from '../util/sequelize'
import { IdType } from '../../types/server/models'
import { TAG_KEY_REGEX, TAG_STRING_REGEX } from '../../shared/util/validation'

export interface TagType extends IdType, Sequelize.Model {
  readonly tagString: string
  readonly tagKey: string
}

// For sequelize define
type TagTypeStatic = typeof Sequelize.Model & {
  new (values?: object, options?: Sequelize.BuildOptions): TagType
}

export const Tag = <TagTypeStatic>sequelize.define(
  'tag',
  {
    tagString: {
      type: Sequelize.STRING(255),
      allowNull: false,
      unique: true,
      validate: {
        is: TAG_STRING_REGEX,
      },
    },
    tagKey: {
      type: Sequelize.STRING(255),
      allowNull: false,
      validate: {
        is: TAG_KEY_REGEX,
      },
    },
  },
  {
    defaultScope: {
      useMaster: true,
    },
    scopes: {
      /**
       * Use the replica database for read queries. To be enabled
       * when realtime data is not needed.
       */
      useReplica: {
        useMaster: undefined,
      },
    },
    hooks: {
      afterCreate: async (_: TagType, options) => {
        if (!options.transaction) {
          return Promise.reject(
            new Error('Tag creation must be wrapped in a transaction'),
          )
        }
        return Promise.resolve()
      },
    },
    indexes: [
      {
        unique: false,
        fields: ['tagKey'],
      },
    ],
  },
)
