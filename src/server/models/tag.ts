import Sequelize from 'sequelize'
import { sequelize } from '../util/sequelize'
import { IdType } from '../../types/server/models'

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
      type: Sequelize.TEXT,
      allowNull: false,
    },
    tagKey: {
      type: Sequelize.TEXT,
      allowNull: false,
    },
  },
  {
    hooks: {
      afterCreate: async (tag: TagType, options) => {
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
