import { QueryTypes } from 'sequelize'
import { Url } from './url'
import { sequelize } from '../util/sequelize'
import { StorableUrlState } from '../repositories/enums'

const { tableName } = Url
const INDEX_NAME = 'urls_weighted_search_idx'

// Warning: This expression has to be EXACTLY the same as the one used in the index
// or else the index will not be used leading to unnecessarily long query times.
export const urlSearchVector = `
  setweight(to_tsvector('english', ${tableName}."shortUrl"), 'A') ||
  setweight(to_tsvector('english', ${tableName}."description"), 'B')
`

export const urlSearchConditions = `urls.state = '${StorableUrlState.Active}' AND urls.description != ''`

const dropIndex = `DROP INDEX IF EXISTS ${INDEX_NAME};`
const createIndex = `CREATE INDEX urls_weighted_search_idx ON urls USING gin ((${urlSearchVector}))
    WHERE ${urlSearchConditions};`

export async function syncSearchIndex() {
  await sequelize.query(`${dropIndex} ${createIndex}`, {
    type: QueryTypes.RAW,
  })
}
