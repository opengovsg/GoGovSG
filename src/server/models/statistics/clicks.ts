import Sequelize from 'sequelize'

import { sequelize } from '../../util/sequelize'
import { IdType } from '../../../types/server/models'

export interface ClicksType extends IdType, Sequelize.Model {
  readonly shortUrl: string
  readonly date: string
  readonly clicks: number
  readonly createdAt: string
  readonly updatedAt: string
}

type ClicksTypeStatic = typeof Sequelize.Model & {
  new (values?: object, options?: Sequelize.BuildOptions): ClicksType
}

export const Clicks = <ClicksTypeStatic>sequelize.define(
  'daily_stats',
  {
    shortUrl: {
      type: Sequelize.STRING,
      primaryKey: true,
      validate: {
        is: /^[a-z0-9-]+$/,
      },
    },
    date: {
      type: Sequelize.DATEONLY,
      primaryKey: true,
    },
    clicks: {
      type: Sequelize.INTEGER,
      defaultValue: 0,
    },
  },
  {
    indexes: [
      {
        unique: true,
        fields: ['shortUrl', 'date'],
      },
    ],
  },
)
