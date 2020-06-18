import Sequelize from 'sequelize'

import { sequelize } from '../../util/sequelize'
import { IdType } from '../../../types/server/models'

export interface DevicesType extends IdType, Sequelize.Model {
  readonly shortUrl: string
  readonly mobile: number
  readonly tablet: number
  readonly desktop: number
  readonly others: number
  readonly createdAt: string
  readonly updatedAt: string
}

type DevicesTypeStatic = typeof Sequelize.Model & {
  new (values?: object, options?: Sequelize.BuildOptions): DevicesType
}

export const Devices = <DevicesTypeStatic>sequelize.define('devices_stats', {
  shortUrl: {
    type: Sequelize.STRING,
    primaryKey: true,
    validate: {
      is: /^[a-z0-9-]+$/,
    },
  },
  mobile: {
    type: Sequelize.INTEGER,
    defaultValue: 0,
  },
  tablet: {
    type: Sequelize.INTEGER,
    defaultValue: 0,
  },
  desktop: {
    type: Sequelize.INTEGER,
    defaultValue: 0,
  },
  others: {
    type: Sequelize.INTEGER,
    defaultValue: 0,
  },
})
