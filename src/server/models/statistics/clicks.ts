import Sequelize from 'sequelize'

import { sequelize } from '../../util/sequelize'
import { IdType } from '../../../types/server/models'
import { SHORT_URL_REGEX } from '../../../shared/util/validation'

export interface UrlClicksType extends IdType, Sequelize.Model {
  readonly shortUrl: string
  readonly clicks: number
  readonly createdAt: string
  readonly updatedAt: string
}

type UrlClicksTypeStatic = typeof Sequelize.Model & {
  new (values?: object, options?: Sequelize.BuildOptions): UrlClicksType
}

export const UrlClicks = <UrlClicksTypeStatic>sequelize.define(
  'url_clicks',
  {
    shortUrl: {
      type: Sequelize.STRING,
      primaryKey: true,
      validate: {
        is: SHORT_URL_REGEX,
      },
    },
    clicks: {
      type: Sequelize.INTEGER,
      defaultValue: 0,
      allowNull: false,
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
      useReplica() {
        return {
          useMaster: false,
        }
      },
    },
  },
)
