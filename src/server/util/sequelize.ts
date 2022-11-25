import Sequelize, { Transaction } from 'sequelize'
import {
  dbPoolSize,
  logger,
  masterDatabaseCredentials,
  replicaDatabaseCredentials,
} from '../config'

export const sequelize = new Sequelize.Sequelize({
  dialect: 'postgres',
  timezone: '+08:00',
  logging: logger.info.bind(logger),
  pool: {
    max: dbPoolSize,
  },
  replication: {
    read: [replicaDatabaseCredentials],
    write: masterDatabaseCredentials,
  },
})

export function transaction<T>(
  autoCallback: (t: Transaction) => PromiseLike<T>,
): Promise<T> {
  return sequelize.transaction(autoCallback)
}

export function escapeWildcard(str: string) {
  return str.replace(/(_|%|\\)/g, '\\$1')
}
