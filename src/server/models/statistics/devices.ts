import Sequelize from 'sequelize'

import { sequelize } from '../../util/sequelize'
import { IdType } from '../../../types/server/models'

export interface DevicesType extends IdType, Sequelize.Model {
  readonly mobile: number
  readonly tablet: number
  readonly desktop: number
  readonly createdAt: string
  readonly updatedAt: string
}

type DevicesTypeStatic = typeof Sequelize.Model & {
  new (values?: object, options?: Sequelize.BuildOptions): DevicesType
}

export const Devices = <DevicesTypeStatic>sequelize.define('devices_stats', {
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
})
