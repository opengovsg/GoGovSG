import Sequelize from 'sequelize'

import { sequelize } from '../../util/sequelize'
import { IdType } from '../../../types/server/models'
import { StorageDay } from '../../repositories/enums'

export interface HeatMapType extends IdType, Sequelize.Model {
  readonly shortUrl: string
  readonly sgtDay: StorageDay
  readonly clicks: number
  readonly createdAt: string
  readonly updatedAt: string
}

type HeatMapTypeStatic = typeof Sequelize.Model & {
  new (values?: object, options?: Sequelize.BuildOptions): HeatMapType
}

export const HeatMap = <HeatMapTypeStatic>sequelize.define('day_stats', {
  shortUrl: {
    type: Sequelize.STRING,
    primaryKey: true,
    validate: {
      is: /^[a-z0-9-]+$/,
    },
  },
  sgtDay: {
    type: Sequelize.ENUM,
    values: [
      StorageDay.Monday,
      StorageDay.Tuesday,
      StorageDay.Wednesday,
      StorageDay.Thursday,
      StorageDay.Friday,
      StorageDay.Saturday,
      StorageDay.Sunday,
    ],
    primaryKey: true,
  },
  clicks: {
    type: Sequelize.INTEGER,
    allowNull: false,
    defaultValue: 0,
  },
})
