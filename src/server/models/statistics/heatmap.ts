import Sequelize from 'sequelize'

import { sequelize } from '../../util/sequelize'
import { IdType } from '../../../types/server/models'
import { StorageWeekState } from '../../repositories/enums'

export interface HeatMapType extends IdType, Sequelize.Model {
  readonly day: StorageWeekState
  readonly clicks: number
  readonly createdAt: string
  readonly updatedAt: string
}

type HeatMapTypeStatic = typeof Sequelize.Model & {
  new (values?: object, options?: Sequelize.BuildOptions): HeatMapType
}

export const HeatMap = <HeatMapTypeStatic>sequelize.define('day_stats', {
  day: {
    type: Sequelize.ENUM,
    values: [
      StorageWeekState.Monday,
      StorageWeekState.Tuesday,
      StorageWeekState.Wednesday,
      StorageWeekState.Thursday,
      StorageWeekState.Friday,
      StorageWeekState.Saturday,
      StorageWeekState.Sunday,
    ],
  },
  clicks: {
    type: Sequelize.INTEGER,
    allowNull: false,
    defaultValue: 0,
  },
})
