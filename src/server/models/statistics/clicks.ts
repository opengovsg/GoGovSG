import Sequelize from 'sequelize'

import { sequelize } from '../../util/sequelize'
import { IdType } from '../../../types/server/models'

export interface UrlClicksType extends IdType, Sequelize.Model {
  readonly shortUrl: string
  readonly clicks: number
  readonly createdAt: string
  readonly updatedAt: string
}

type UrlClicksTypeStatic = typeof Sequelize.Model & {
  new (values?: object, options?: Sequelize.BuildOptions): UrlClicksType
}

export const UrlClicks = <UrlClicksTypeStatic>sequelize.define('url_clicks', {
  shortUrl: {
    type: Sequelize.STRING,
    primaryKey: true,
    validate: {
      is: /^[a-z0-9-]+$/,
    },
  },
  clicks: {
    type: Sequelize.INTEGER,
    defaultValue: 0,
    allowNull: false,
  },
})
