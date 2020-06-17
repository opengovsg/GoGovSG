import Sequelize from 'sequelize'

import { sequelize } from '../../util/sequelize'
import { IdType } from '../../../types/server/models'

export interface ClicksType extends IdType, Sequelize.Model {
  readonly date: string
  readonly clicks: number
  readonly createdAt: string
  readonly updatedAt: string
}

type ClicksTypeStatic = typeof Sequelize.Model & {
  new (values?: object, options?: Sequelize.BuildOptions): ClicksType
}

export const Clicks = <ClicksTypeStatic>sequelize.define('click_stats', {
  date: {
    type: Sequelize.INTEGER,
  },
  clicks: {
    type: Sequelize.INTEGER,
    defaultValue: 0,
  },
})
