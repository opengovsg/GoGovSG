import Sequelize, { Transaction } from 'sequelize'
import { databaseUri, dbPoolSize, logger } from '../config'

export const sequelize = new Sequelize.Sequelize(databaseUri, {
  dialect: 'postgres',
  timezone: '+08:00',
  logging: logger.info.bind(logger),
  pool: {
    max: dbPoolSize,
  },
})

export function transaction<T>(
  autoCallback: (t: Transaction) => PromiseLike<T>,
): Promise<T> {
  return sequelize.transaction(autoCallback)
}
