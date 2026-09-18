import Sequelize from 'sequelize'

import { sequelize } from '../../util/sequelize.js'
import { IdType } from '../../../types/server/models/index.js'
import { SHORT_URL_REGEX } from '../../../shared/util/validation.js'

export interface DailyClicksType extends IdType, Sequelize.Model {
  readonly shortUrl: string
  readonly date: string
  readonly clicks: number
  readonly createdAt: string
  readonly updatedAt: string
}

type DailyClicksTypeStatic = typeof Sequelize.Model & {
  new (values?: object, options?: Sequelize.BuildOptions): DailyClicksType
}

export const DailyClicks = <DailyClicksTypeStatic>sequelize.define(
  'daily_stats',
  {
    shortUrl: {
      type: Sequelize.STRING,
      primaryKey: true,
      validate: {
        is: SHORT_URL_REGEX,
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
)
